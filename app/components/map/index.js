import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Alert, AppState, BackHandler, Dimensions, Image, LayoutAnimation, Platform, Text, View } from 'react-native';
import * as Sentry from '@sentry/react-native';

import { LOCATION_TRACKING, REPORTS } from 'config/constants';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import toUpper from 'lodash/toUpper';
import kebabCase from 'lodash/kebabCase';
import deburr from 'lodash/deburr';
import moment from 'moment';

import CircleButton from 'components/common/circle-button';
import MapAttribution from 'components/map/map-attribution';
import BottomDialog from 'components/map/bottom-dialog';
import LocationErrorBanner from 'components/map/locationErrorBanner';
import {
  formatCoordsByFormat,
  formatDistance,
  getDistanceOfLine,
  getMapZoom,
  getNeighboursSelected,
  getPolygonBoundingBox
} from 'helpers/map';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';

import Theme from 'config/theme';
import i18n from 'i18next';
import styles from './styles';
import { Navigation } from 'react-native-navigation';
import SafeArea, { withSafeArea } from 'react-native-safe-area';
import MapboxGL from '@react-native-mapbox-gl/maps';

const SafeAreaView = withSafeArea(View, 'margin', 'top');
const FooterSafeAreaView = withSafeArea(View, 'margin', 'bottom');

import {
  GFWLocationAuthorizedAlways,
  GFWLocationAuthorizedInUse,
  GFWOnLocationEvent,
  GFWOnHeadingEvent,
  GFWOnErrorEvent,
  GFWErrorLocationStale,
  showAppSettings,
  showLocationSettings,
  startTrackingLocation,
  stopTrackingLocation,
  startTrackingHeading,
  stopTrackingHeading
} from 'helpers/location';

const emitter = require('tiny-emitter/instance');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 5;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN = 0;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING = 1;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_STOPPING = 2;

/**
 * Elapsed time in milliseconds after which we should consider the most recent location "stale", presumably because we
 * were unable to obtain a GPS fix
 *
 * @type {number}
 */
const STALE_LOCATION_THRESHOLD = LOCATION_TRACKING.interval * 3;

const backButtonImage = require('assets/back.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const settingsBlackIcon = require('assets/settings_black.png');
const startTrackingIcon = require('assets/startTracking.png');
const stopTrackingIcon = require('assets/stopTracking.png');
const myLocationIcon = require('assets/my_location.png');
const createReportIcon = require('assets/createReport.png');
const reportAreaIcon = require('assets/report_area.png');
const addLocationIcon = require('assets/add_location.png');
const newAlertIcon = require('assets/new-alert.png');
const closeIcon = require('assets/close_gray.png');

class MapComponent extends Component {
  margin = Platform.OS === 'ios' ? 50 : 100;
  FIT_OPTIONS = {
    edgePadding: { top: this.margin, right: this.margin, bottom: this.margin, left: this.margin },
    animated: false
  };

  static options(passProps) {
    return {
      statusBar: {
        style: Platform.select({ android: 'light', ios: 'dark' })
      },
      topBar: {
        background: {
          color: 'transparent',
          translucent: true
        },
        drawBehind: true,
        title: {
          color: Theme.fontColors.white,
          text: i18n.t('dashboard.map')
        },
        leftButtons: [
          {
            id: 'backButton',
            icon: backButtonImage,
            color: Theme.fontColors.white
          }
        ],
        rightButtons: [
          {
            color: Theme.fontColors.white,
            id: 'settings',
            icon: settingsBlackIcon
          }
        ]
      }
    };
  }

  /**
   * The AppState listener for this component is responsible for stopping location tracking if it's not needed while
   * the app is backgrounded, and resuming it when foregrounded.
   *
   * However, a quirk of Android is that the location permissions dialog puts the app into the background while it is
   * visible. This caused an issue where starting location tracking would trigger a permissions dialog. If the user
   * clicked deny, the user would re-enter the foreground, location tracking would be started again, which would in
   * turn prompt the user again.
   *
   * We can workaround this by temporarily disabling the app state listener while location tracking is being setup.
   * Because only Android is affected we only do this on that platform.
   */
  isStartingGeolocation = false;
  isGeolocationPausedInBackground = false;

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      bottomSafeAreaInset: 0,
      lastPosition: null,
      hasCompass: false,
      heading: null,
      region: {
        latitude: undefined, // These are undefined, as when the map is ready it'll move the map to focus on the area.
        longitude: undefined,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      markers: [],
      selectedAlerts: [],
      neighbours: [],
      mapZoom: 2,
      customReporting: false,
      dragging: false,
      layoutHasForceRefreshed: false,
      routeTrackingDialogState: ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN,
      locationError: null,
      mapCameraBounds: getPolygonBoundingBox(props.areaCoordinates)
    };

    SafeArea.getSafeAreaInsetsForRootView().then(result => {
      return this.setState({
        bottomSafeAreaInset: result.safeAreaInsets.bottom
      });
    });
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'settings') {
      this.onSettingsPress();
    } else if (buttonId === 'backButton') {
      this.handleBackPress();
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    AppState.addEventListener('change', this.handleAppStateChange);

    tracker.trackScreenView('Map');

    emitter.on(GFWOnHeadingEvent, this.updateHeading);
    emitter.on(GFWOnLocationEvent, this.updateLocationFromGeolocation);

    this.geoLocate();

    this.staleLocationTimer = setInterval(() => {
      this.setState(state => {
        if (
          !state.locationError &&
          state.location &&
          Date.now() - state.location.timestamp > STALE_LOCATION_THRESHOLD
        ) {
          return {
            locationError: GFWErrorLocationStale
          };
        }
        return {};
      });
    }, 1000);
  }

  onLocationUpdateError = error => {
    this.setState({
      locationError: error.code
    });
  };

  componentDidAppear() {
    const { setCanDisplayAlerts, canDisplayAlerts } = this.props;
    if (!canDisplayAlerts) {
      setCanDisplayAlerts(true);
    }
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.MapWalkthrough',
              options: {
                layout: { 
                  backgroundColor: 'transparent',
                  componentBackgroundColor: 'rgba(0,0,0,0.74)' 
                },
                screenBackgroundColor: 'rgba(0,0,0,0.74)',
                modalPresentationStyle: 'overFullScreen'
              }
            }
          }
        ]
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { area, setActiveAlerts } = this.props;
    if (area && area.dataset) {
      const differentArea = area.id !== prevProps.area.id;
      const datasetChanged = !isEqual(area.dataset, prevProps.area.dataset);
      if (differentArea || datasetChanged) {
        setActiveAlerts();
        this.updateMarkers();
        if (differentArea) {
          this.updateSelectedArea();
        }
      }
    }

    if (prevState.lastPosition !== this.state.lastPosition) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          title: {
            text: formatCoordsByFormat(this.state.lastPosition, this.props.coordinatesFormat)
          }
        }
      });
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);

    // If we're currently tracking a location, don't stop watching for updates!
    if (!this.isRouteTracking()) {
      stopTrackingLocation();
    }

    clearInterval(this.staleLocationTimer);

    // Do remove the emitter listeners here, as we don't want this screen to receive anything while it's non-existent!
    emitter.off(GFWOnLocationEvent, this.updateLocationFromGeolocation);
    emitter.off(GFWOnHeadingEvent);
    emitter.off(GFWOnErrorEvent, this.onLocationUpdateError);
    stopTrackingHeading();

    this.props.setSelectedAreaId('');
  }

  /**
   * Pause background location tracking while the map screen is backgrounded or inactive, UNLESS we are route tracking
   *
   * @param status
   */
  handleAppStateChange = status => {
    if (!this.isRouteTracking() && !this.isStartingGeolocation) {
      switch (status) {
        case 'background':
        case 'inactive': {
          stopTrackingLocation();
          stopTrackingHeading();
          this.isGeolocationPausedInBackground = true;
          break;
        }
        case 'active': {
          if (this.isGeolocationPausedInBackground) {
            this.geoLocate(false);
          }
          this.isGeolocationPausedInBackground = false;
          break;
        }
      }
    }
  };

  handleBackPress = debounceUI(() => {
    if (this.isRouteTracking()) {
      if (this.state.routeTrackingDialogState) {
        this.closeBottomDialog();
      } else {
        this.showBottomDialog(true);
      }
    } else {
      Navigation.pop(this.props.componentId);
    }
    return true;
  });

  /**
   * geoLocate - Resets the location / heading event listeners, calling specific callbacks depending on whether we're tracking a route or not.
   */
  async geoLocate(trackWhenInBackground = this.isRouteTracking()) {
    // These start methods will stop any previously running trackers if necessary
    try {
      startTrackingHeading();
    } catch (err) {
      // continue without tracking heading...
      console.warn('3SC', 'Could not start tracking heading...', err);
      Sentry.captureException(err);
    }

    // See documentation for this variable declaration for explanation
    this.isStartingGeolocation = Platform.OS === 'android';

    try {
      await startTrackingLocation(trackWhenInBackground ? GFWLocationAuthorizedAlways : GFWLocationAuthorizedInUse);
    } catch (err) {
      console.warn('3SC', 'Could not start tracking location...', err);
      this.onLocationUpdateError(err);
      Sentry.captureException(err);
      throw err;
    } finally {
      this.isStartingGeolocation = false;
    }
  }

  isRouteTracking = () => {
    return !!this.props.isTracking;
  };

  /**
   * onStartTrackingPressed - When pressed, updates redux with the location we're routing to & changes event listeners.
   * If the user has not given 'always' location permissions, an alert is shown.
   */
  onStartTrackingPressed = debounceUI(async () => {
    try {
      await this.geoLocate(true);

      this.props.onStartTrackingRoute(
        this.state.selectedAlerts[this.state.selectedAlerts.length - 1],
        this.props.area.id
      );

      this.onSelectionCancelPress();

      emitter.on(GFWOnErrorEvent, this.onLocationUpdateError);
    } catch (err) {
      Alert.alert(
        i18n.t('routes.insufficientPermissionsDialogTitle'),
        i18n.t('routes.insufficientPermissionsDialogMessage'),
        [
          { text: i18n.t('commonText.ok') },
          {
            text: i18n.t('routes.insufficientPermissionsDialogOpenAppSettings'),
            onPress: showAppSettings
          },
          ...Platform.select({
            android: [
              {
                text: i18n.t('routes.insufficientPermissionsDialogOpenDeviceSettings'),
                onPress: showLocationSettings
              }
            ],
            ios: [{}]
          })
        ]
      );
    }
  });

  onStopTrackingPressed = debounceUI(() => {
    // This doesn't immediately stop tracking - it will give the user the choice of saving and deleting and only stop
    // tracking once they have finalised one of those actions
    this.showBottomDialog(false);
  });

  openSaveRouteScreen = debounceUI(() => {
    this.closeBottomDialog();
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.SaveRoute'
      }
    });
  });

  showBottomDialog = debounceUI((isExiting = false) => {
    this.setState({
      routeTrackingDialogState: isExiting
        ? ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING
        : ROUTE_TRACKING_BOTTOM_DIALOG_STATE_STOPPING
    });
    LayoutAnimation.easeInEaseOut();
  });

  closeBottomDialog = debounceUI(() => {
    this.setState({ routeTrackingDialogState: ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN });
    LayoutAnimation.easeInEaseOut();
  });

  onStopAndDeleteRoute = debounceUI(() => {
    Alert.alert(i18n.t('routes.confirmDeleteTitle'), i18n.t('routes.confirmDeleteMessage'), [
      {
        text: i18n.t('commonText.confirm'),
        onPress: () => {
          try {
            this.props.onCancelTrackingRoute();
            this.closeBottomDialog();
          } catch (err) {
            console.warn('Error when discarding route', err);
            Sentry.captureException(err);
          } finally {
            this.geoLocate(false);
          }
        }
      },
      {
        text: i18n.t('commonText.cancel'),
        style: 'cancel'
      }
    ]);
  });

  /**
   * updateLocationFromGeolocation - Handles any location updates that arrive while the user is on this screen.
   */
  updateLocationFromGeolocation = throttle(location => {
    this.setState({
      lastPosition: location,
      locationError: null
    });
  }, 300);

  updateHeading = throttle(heading => {
    this.setState(prevState => {
      const state = {
        heading: parseInt(heading, 10)
      };
      if (!prevState.hasCompass) {
        state.hasCompass = true;
      }
      return state;
    });
  }, 450);

  onCustomReportingPress = debounceUI(() => {
    // If the region's latitude & longitude aren't set, we shouldn't enter custom reporting mode!
    if (!(this.state.region.latitude && this.state.region.longitude)) {
      return;
    }

    this.setState(prevState => ({
      customReporting: true,
      selectedAlerts: [prevState.region]
    }));
  });

  onSelectionCancelPress = debounceUI(() => {
    this.setState({
      customReporting: false,
      selectedAlerts: [],
      neighbours: []
    });
  });

  onSettingsPress = debounceUI(() => {
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        right: {
          visible: true
        }
      }
    });
  });

  onMapReady = () => {
    this.forceRefreshLayout();
    if (this.props.areaCoordinates) {
      requestAnimationFrame(() => this.map.fitToCoordinates(this.props.areaCoordinates, this.FIT_OPTIONS));
    }
    this.props.setActiveAlerts();
    this.updateMarkers();
  };

  /**
   * Makes the compass usable. The mapPadding property of the MapView by default clips/crops the map views instead
   * of applying the padding and pushing them inwards.
   *
   * This method forces the map view to redraw/layout after the padding has been applied and fixes the problem.
   * GitHub Issues:
   * https://github.com/react-native-community/react-native-maps/issues/2336
   * https://github.com/react-native-community/react-native-maps/issues/1033
   */
  forceRefreshLayout = () => {
    if (!this.state.layoutHasForceRefreshed) {
      this.setState({
        layoutHasForceRefreshed: true
      });
    }
  };

  getMarkerSize() {
    const { mapZoom } = this.state;
    const expandClusterZoomLevel = 15;
    const initialMarkerSize = 18;

    const scale = mapZoom - expandClusterZoomLevel;
    const rescaleFactor = mapZoom <= expandClusterZoomLevel ? 1 : scale;
    const size = initialMarkerSize * rescaleFactor;
    return { height: size, width: size };
  }

  updateMarkers = debounce((clean = false) => {
    const { region, mapZoom } = this.state;
    const bbox = [
      region.longitude - region.longitudeDelta / 2,
      region.latitude - region.latitudeDelta / 2,
      region.longitude + region.longitudeDelta / 2,
      region.latitude + region.latitudeDelta / 2
    ];
    const clusters = null;
    const markers = clusters || [];
    markers.activeMarkersId = markers.length > 0 ? bbox.join('_') + mapZoom : '';

    if (clean) {
      this.setState({
        markers,
        selectedAlerts: [],
        neighbours: []
      });
    } else {
      this.setState({ markers });
    }
  }, 300);

  // Zoom map to user location
  zoomToUserLocation = debounceUI(() => {
    const { lastPosition } = this.state;
    if (lastPosition) {
      // todo: do we want to includes selected alert on zoomToUserLocation?
      this.mapCamera.setCamera({
        centerCoordinate: [lastPosition.longitude, lastPosition.latitude],
        zoomLevel: 16,
        animationDuration: 2000
      });
    }
  });

  reportSelection = debounceUI(() => {
    this.createReport(this.state.selectedAlerts);
  });

  reportArea = debounceUI(() => {
    this.createReport([...this.state.selectedAlerts, ...this.state.neighbours]);
  });

  createReport = selectedAlerts => {
    this.props.setCanDisplayAlerts(false);
    const { area } = this.props;
    const { lastPosition } = this.state;
    let latLng = [];
    if (selectedAlerts && selectedAlerts.length > 0) {
      latLng = selectedAlerts.map(alert => ({
        lat: alert.latitude,
        lon: alert.longitude
      }));
    } else if (this.isRouteTracking() && lastPosition) {
      latLng = [
        {
          lat: lastPosition.latitude,
          lon: lastPosition.longitude
        }
      ];
    }

    const userLatLng =
      this.state.lastPosition && `${this.state.lastPosition.latitude},${this.state.lastPosition.longitude}`;
    const reportedDataset = area.dataset ? `-${area.dataset.name}` : '';
    const areaName = toUpper(kebabCase(deburr(area.name)));
    const reportName = `${areaName}${reportedDataset}-REPORT--${moment().format('YYYY-MM-DDTHH:mm:ss')}`;
    this.props.createReport({
      area,
      reportName,
      userPosition: userLatLng || REPORTS.noGpsPosition,
      clickedPosition: JSON.stringify(latLng)
    });

    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.NewReport',
              passProps: { reportName }
            }
          }
        ]
      }
    });
  };

  onRegionChangeComplete = region => {
    const mapZoom = getMapZoom(region);

    this.setState(
      prevState => ({
        region,
        mapZoom,
        selectedAlerts: prevState.customReporting && prevState.dragging ? [region] : prevState.selectedAlerts,
        dragging: false
      }),
      () => {
        this.updateMarkers();
      }
    );
  };

  zoomTo = (coordinates, id) => {
    // We substract one so there's always some margin
    const zoomScale = 1.0;
    const zoomCoordinates = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: this.state.region.latitudeDelta / zoomScale,
      longitudeDelta: this.state.region.longitudeDelta / zoomScale
    };
    this.map.animateToRegion(zoomCoordinates);
  };

  selectAlert = coordinate => {
    if (coordinate && !this.state.customReporting) {
      this.setState(prevState => ({
        neighbours: getNeighboursSelected([...prevState.selectedAlerts, coordinate], prevState.markers),
        selectedAlerts: [...prevState.selectedAlerts, coordinate]
      }));
    }
  };

  removeSelection = coordinate => {
    this.setState(state => {
      let neighbours = [];
      if (state.selectedAlerts && state.selectedAlerts.length > 0) {
        const selectedAlerts = state.selectedAlerts.filter(
          alert => alert.latitude !== coordinate.latitude || alert.longitude !== coordinate.longitude
        );
        neighbours = selectedAlerts.length > 0 ? getNeighboursSelected(selectedAlerts, state.markers) : [];
        return {
          neighbours,
          selectedAlerts
        };
      }
      return { selectedAlerts: [] };
    });
  };

  includeNeighbour = coordinate => {
    this.setState(state => {
      const selectedAlerts = [...state.selectedAlerts, coordinate];
      const neighbours = getNeighboursSelected(selectedAlerts, state.markers);
      return {
        neighbours,
        selectedAlerts
      };
    });
  };

  updateSelectedArea = () => {
    this.setState(
      {
        neighbours: [],
        selectedAlerts: []
      },
      () => {
        if (this.map && this.props.areaCoordinates) {
          this.map.fitToCoordinates(this.props.areaCoordinates, this.FIT_OPTIONS);
        }
      }
    );
  };

  /**
   * getCoordinateAndDistanceText - Returns the location and distance text.
   */
  getCoordinateAndDistanceText = () => {
    const getCoordinateText = (targetLocation, currentLocation) => {
      const { coordinatesFormat } = this.props;

      if (targetLocation && currentLocation) {
        const distance = getDistanceOfLine(targetLocation, currentLocation);

        return `${i18n.t('map.destination')} ${formatCoordsByFormat(targetLocation, coordinatesFormat)}\n${i18n.t(
          'map.distance'
        )} ${formatDistance(distance)}`;
      }

      return '';
    };

    const { selectedAlerts, lastPosition } = this.state;
    const { route } = this.props;

    if (this.isRouteTracking()) {
      // Show the destination coordinates.
      return getCoordinateText(route.destination, lastPosition);
    } else if (selectedAlerts && selectedAlerts.length > 0) {
      // Show the selected alert coordinate.
      const last = selectedAlerts.length - 1;
      const coordinates = {
        latitude: selectedAlerts[last].latitude,
        longitude: selectedAlerts[last].longitude
      };
      return getCoordinateText(coordinates, lastPosition);
    } else {
      // Show nothing!
      return '';
    }
  };

  renderButtonPanel() {
    const { customReporting, lastPosition, locationError, neighbours, selectedAlerts } = this.state;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;
    const hasNeighbours = neighbours && neighbours.length > 0;
    const canReport = hasAlertsSelected || customReporting;
    const isRouteTracking = this.isRouteTracking();

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <React.Fragment>
        <LocationErrorBanner
          style={{ margin: 16 }}
          locationError={locationError}
          mostRecentLocationTime={lastPosition?.timestamp}
        />
        <View style={styles.buttonPanel}>
          {canReport ? (
            <React.Fragment>
              <CircleButton shouldFillContainer onPress={this.reportSelection} light icon={createReportIcon} />
              {hasNeighbours && <CircleButton shouldFillContainer onPress={this.reportArea} icon={reportAreaIcon} />}
            </React.Fragment>
          ) : (
            <CircleButton shouldFillContainer onPress={this.onCustomReportingPress} icon={addLocationIcon} />
          )}
          {lastPosition ? (
            <CircleButton shouldFillContainer onPress={this.zoomToUserLocation} light icon={myLocationIcon} />
          ) : null}
          {canReport ? (
            <CircleButton light icon={closeIcon} style={styles.btnLeft} onPress={this.onSelectionCancelPress} />
          ) : null}
          {isRouteTracking || canReport ? (
            <CircleButton
              shouldFillContainer
              onPress={this.isRouteTracking() ? this.onStopTrackingPressed : this.onStartTrackingPressed}
              light
              icon={this.isRouteTracking() ? stopTrackingIcon : startTrackingIcon}
            />
          ) : null}
        </View>
      </React.Fragment>
    );
  }

  renderMapFooter() {
    const { selectedAlerts, neighbours } = this.state;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;

    const hasNeighbours = neighbours && neighbours.length > 0;
    let veilHeight = 120;
    if (hasAlertsSelected) {
      veilHeight = hasNeighbours ? 260 : 180;
    }

    return [
      <View key="bg" pointerEvents="none" style={[styles.footerBGContainer, { height: veilHeight }]}>
        <Image style={[styles.footerBg, { height: veilHeight }]} source={backgroundImage} />
      </View>,
      <FooterSafeAreaView key="footer" pointerEvents="box-none" style={styles.footer}>
        {this.renderButtonPanel()}
        <MapAttribution />
      </FooterSafeAreaView>
    ];
  }

  renderRouteTrackingDialog() {
    return this.state.routeTrackingDialogState !== ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN ? (
      <BottomDialog
        title={i18n.t('routes.stopRouteTrackingPanelTitle')}
        closeDialog={this.closeBottomDialog}
        buttons={[
          ...(this.state.routeTrackingDialogState === ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING
            ? [
                {
                  text: i18n.t('routes.stopRouteTrackingPanelContinueOption'),
                  onPress: debounceUI(() => Navigation.pop(this.props.componentId)),
                  buttonProps: {}
                }
              ]
            : []),
          {
            text: i18n.t('routes.stopRouteTrackingPanelSaveOption'),
            onPress: this.openSaveRouteScreen,
            buttonProps: { transparent: true }
          },
          {
            text: i18n.t('routes.stopRouteTrackingPanelDeleteOption'),
            onPress: this.onStopAndDeleteRoute,
            buttonProps: { delete: true, transparent: true }
          }
        ]}
      />
    ) : null;
  }

  onMoveShouldSetResponder = () => {
    // Hack to fix onPanDrag not working for iOS when scroll enabled
    // https://github.com/react-community/react-native-maps/blob/master/docs/mapview.md
    this.setState({ dragging: true });
    return false;
  };

  render() {
    const { customReporting } = this.state;

    const { isConnected, isOfflineMode } = this.props;

    const customReportingElement = customReporting ? (
      <View
        pointerEvents="none"
        style={[styles.customLocationFixed, this.state.dragging ? styles.customLocationTransparent : '']}
      >
        <Image style={[Theme.icon, styles.customLocationMarker]} source={newAlertIcon} />
      </View>
    ) : null;

    const containerStyle = this.state.layoutHasForceRefreshed
      ? [styles.container, styles.forceRefresh]
      : styles.container;

    const userLocationElement = <MapboxGL.UserLocation visible={true} />;

    const mapCameraElement = (
      <MapboxGL.Camera
        ref={ref => {
          this.mapCamera = ref;
        }}
        // centerCoordinate={areaCoordinates || undefined}
        bounds={this.state.mapCameraBounds}
        animationDuration={0}
      />
    );

    return (
      <View style={containerStyle} onMoveShouldSetResponder={this.onMoveShouldSetResponder}>
        <View pointerEvents="none" style={styles.header}>
          <Image style={styles.headerBg} source={backgroundImage} />
          <SafeAreaView>
            {!isConnected && (
              <Text style={styles.offlineNotice}>
                {isOfflineMode ? i18n.t('settings.offlineMode') : i18n.t('commonText.connectionRequiredTitle')}
              </Text>
            )}
            <Text style={styles.coordinateText}>{this.getCoordinateAndDistanceText()}</Text>
          </SafeAreaView>
        </View>
        {/*
        <MapView
          ref={ref => {
            this.map = ref;
          }}
          style={{
            ...styles.map,
            bottom: styles.map.bottom - this.state.bottomSafeAreaInset
          }}
          provider={MapView.PROVIDER_GOOGLE}
          mapPadding={Platform.OS === 'android' ? { top: 40, bottom: 0, left: 0, right: 0 } : undefined}
          mapType="none"
          minZoomLevel={2}
          maxZoomLevel={18}
          showsCompass
          rotateEnabled
          moveOnMarkerPress={false}
          onMapReady={this.onMapReady}
          onRegionChangeComplete={this.onRegionChangeComplete}
        >
          <Basemap areaId={area.id} />
          {contextualLocalLayerElement}
          {contextualRemoteLayerElement}
          {clustersElement}
          {compassLineElement}
          <RouteMarkers isTracking={this.isRouteTracking()} lastPosition={lastPosition} route={route} />
          {areaPolygonElement}
          {neighboursAlertsElement}
          {selectedAlertsElement}
          {userPositionElement}
          {compassElement}
        </MapView>
        */}
        <MapboxGL.MapView style={{ flex: 1 }} styleURL={MapboxGL.StyleURL.SatelliteStreet}>
          {userLocationElement}
          {mapCameraElement}
        </MapboxGL.MapView>
        {customReportingElement}
        {this.renderMapFooter()}
        {this.renderRouteTrackingDialog()}
      </View>
    );
  }
}

MapComponent.propTypes = {
  componentId: PropTypes.string.isRequired,
  createReport: PropTypes.func.isRequired,
  ctxLayerLocalTilePath: PropTypes.string,
  areaCoordinates: PropTypes.array,
  isConnected: PropTypes.bool.isRequired,
  isOfflineMode: PropTypes.bool.isRequired,
  setCanDisplayAlerts: PropTypes.func.isRequired,
  canDisplayAlerts: PropTypes.bool.isRequired,
  area: PropTypes.object.isRequired,
  setActiveAlerts: PropTypes.func.isRequired,
  contextualLayer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string.isRequired
  }),
  coordinatesFormat: PropTypes.string.isRequired,
  setSelectedAreaId: PropTypes.func.isRequired,
  route: PropTypes.object,
  isTracking: PropTypes.bool.isRequired,
  onStartTrackingRoute: PropTypes.func.isRequired,
  onCancelTrackingRoute: PropTypes.func.isRequired
};

export default MapComponent;
