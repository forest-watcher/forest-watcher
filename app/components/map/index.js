import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Alert, BackHandler, Dimensions, Image, LayoutAnimation, Platform, Text, View } from 'react-native';
import { Sentry } from 'react-native-sentry';

import { REPORTS } from 'config/constants';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import toUpper from 'lodash/toUpper';
import kebabCase from 'lodash/kebabCase';
import deburr from 'lodash/deburr';
import moment from 'moment';

import MapView from 'react-native-maps';
import CircleButton from 'components/common/circle-button';
import MapAttribution from 'components/map/map-attribution';
import BottomDialog from 'components/map/bottom-dialog';
import LocationErrorBanner from 'components/map/locationErrorBanner';
import Clusters from 'containers/map/clusters';
import Basemap from 'containers/map/basemap';
import RouteMarkers from './route';
import { formatCoordsByFormat, formatDistance, getDistanceOfLine, getMapZoom, getNeighboursSelected } from 'helpers/map';
import tracker from 'helpers/googleAnalytics';
import clusterGenerator from 'helpers/clusters-generator';
import { LOCATION_TRACKING } from 'config/constants';
import Theme from 'config/theme';
import i18n from 'locales';
import styles from './styles';
import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';

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
  stopTrackingHeading,
  deleteAllLocations
} from 'helpers/location';

var emitter = require('tiny-emitter/instance');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 5;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

/**
 * Elapsed time in milliseconds after which we should consider the most recent location "stale", presumably because we
 * were unable to obtain a GPS fix
 *
 * @type {number}
 */
const STALE_LOCATION_THRESHOLD = LOCATION_TRACKING.interval * 3;

const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN = 0;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING = 1;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_STOPPING = 2;

const backButtonImage = require('assets/back.png');
const markerImage = require('assets/marker.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const settingsBlackIcon = require('assets/settings_black.png');
const startTrackingIcon = require('assets/startTracking.png');
const stopTrackingIcon = require('assets/stopTracking.png');
const myLocationIcon = require('assets/my_location.png');
const createReportIcon = require('assets/createReport.png');
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
          color: Theme.fontColors.white
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

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      lastPosition: null,
      hasCompass: false,
      compassLine: null,
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
      locationError: null,
      routeTrackingDialogState: ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN
    };
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

    if (this.state.selectedAlerts !== prevState.selectedAlerts && !this.isRouteTracking()) {
      this.setHeaderTitle();
    }

    const updateCompassLine = [
      this.state.lastPosition !== prevState.lastPosition,
      this.state.selectedAlerts !== prevState.selectedAlerts
    ];
    if (updateCompassLine.includes(true)) {
      this.setCompassLine();
    }
  }

  componentWillUnmount() {
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

  handleBackPress = () => {
    if (this.isRouteTracking()) {
      this.state.routeTrackingDialogState ? this.closeBottomDialog() : this.showBottomDialog(true);
    } else {
      Navigation.pop(this.props.componentId);
    }
    return true;
  };

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

    try {
      await startTrackingLocation(trackWhenInBackground ? GFWLocationAuthorizedAlways : GFWLocationAuthorizedInUse);
    } catch (err) {
      console.warn('3SC', 'Could not start tracking location...', err);
      this.onLocationUpdateError(err);
      Sentry.captureException(err);
      throw err;
    }
  }

  isRouteTracking = () => {
    return !!this.props.isTracking;
  };

  /**
   * onStartTrackingPressed - When pressed, updates redux with the location we're routing to & changes event listeners.
   * If the user has not given 'always' location permissions, an alert is shown.
   */
  onStartTrackingPressed = async () => {
    try {
      await this.geoLocate(true);

      this.props.onStartTrackingRoute(
        this.state.selectedAlerts[this.state.selectedAlerts.length - 1],
        this.props.area.id
      );

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
  };

  onStopTrackingPressed = () => {
    // This doesn't immediately stop tracking - it will give the user the choice of saving and deleting and only stop
    // tracking once they have finalised one of those actions
    this.showBottomDialog(false);
  };

  openSaveRouteScreen = () => {
    this.closeBottomDialog();
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.SaveRoute'
      }
    });
  };

  showBottomDialog = (isExiting = false) => {
    this.setState({
      routeTrackingDialogState: isExiting
        ? ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING
        : ROUTE_TRACKING_BOTTOM_DIALOG_STATE_STOPPING
    });
    LayoutAnimation.easeInEaseOut();
  };

  closeBottomDialog = () => {
    this.setState({ routeTrackingDialogState: ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN });
    LayoutAnimation.easeInEaseOut();
  };

  onStopAndDeleteRoute = () => {
    Alert.alert(i18n.t('routes.confirmDeleteTitle'), i18n.t('routes.confirmDeleteMessage'), [
      {
        text: i18n.t('commonText.confirm'),
        onPress: async () => {
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
  };

  /**
   * updateLocationFromGeolocation - Handles any location updates that arrive while the user is on this screen.
   */
  updateLocationFromGeolocation = throttle(location => {
    this.setState({
      lastPosition: location,
      locationError: null
    });
    this.setHeaderTitle();
  }, 300);

  updateHeading = throttle(heading => {
    this.setState(prevState => {
      const state = {
        heading: parseInt(heading, 10)
      };
      if (!prevState.hasCompass) state.hasCompass = true;
      return state;
    });
  }, 450);

  onCustomReportingPress = () => {
    this.setState(prevState => ({
      customReporting: true,
      selectedAlerts: [prevState.region]
    }));
  };

  onSelectionCancelPress = () => {
    this.setState({
      customReporting: false,
      selectedAlerts: [],
      neighbours: []
    });
  };

  onSettingsPress = () => {
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        right: {
          visible: true
        }
      }
    });
  };

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

  setCompassLine = () => {
    this.setState(prevState => {
      const state = {};
      if (prevState.selectedAlerts && prevState.selectedAlerts.length > 0 && prevState.lastPosition) {
        const last = prevState.selectedAlerts.length - 1;
        // extract not needed props
        // eslint-disable-next-line no-unused-vars
        const { accuracy, altitude, speed, course, ...rest } = prevState.lastPosition;
        state.compassLine = [{ ...rest }, { ...prevState.selectedAlerts[last] }];
      }
      if (prevState.compassLine !== null && prevState.selectedAlerts.length === 0) {
        state.compassLine = null;
      }
      return state;
    });
  };

  setLocationHeaderTitle = (formattedCoords, targetLocation, currentLocation) => {
    let headerText = i18n.t('dashboard.map');
    let fontSize = 16;

    if (formattedCoords && targetLocation && currentLocation) {
      const distance = getDistanceOfLine(targetLocation, currentLocation);
      headerText = `${formattedCoords}, ${formatDistance(distance)}`;
    } else {
      fontSize = 18;
    }

    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        title: {
          color: Theme.fontColors.white,
          fontSize: fontSize,
          text: headerText
        }
      }
    });
  };

  setHeaderTitle = () => {
    const { selectedAlerts, lastPosition } = this.state;
    const { coordinatesFormat, route } = this.props;

    // If we have selected alerts, and we're not currently tracking a route.
    if (selectedAlerts && selectedAlerts.length > 0 && !this.isRouteTracking()) {
      const last = selectedAlerts.length - 1;
      const coordinates = {
        latitude: selectedAlerts[last].latitude,
        longitude: selectedAlerts[last].longitude
      };
      const coordinateText = formatCoordsByFormat(coordinates, coordinatesFormat);
      this.setLocationHeaderTitle(coordinateText, coordinates, lastPosition);
    } else if (this.isRouteTracking()) {
      const coordinateText = formatCoordsByFormat(route.destination, coordinatesFormat);
      this.setLocationHeaderTitle(coordinateText, route.destination, lastPosition);
    } else {
      this.setLocationHeaderTitle();
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
    const clusters = clusterGenerator.clusters && clusterGenerator.clusters.getClusters(bbox, mapZoom);
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

  fitPosition = () => {
    const { lastPosition, selectedAlerts } = this.state;
    if (lastPosition) {
      const options = { edgePadding: { top: 150, right: 30, bottom: 210, left: 30 }, animated: true };
      const coordinates = [lastPosition];
      if (selectedAlerts.length) {
        let selected = selectedAlerts[selectedAlerts.length - 1];
        if (this.state.customReporting) {
          selected = selectedAlerts[0];
          const oposite = {
            latitude: selected.latitude - lastPosition.latitude + selected.latitude,
            longitude: selected.longitude - lastPosition.longitude + selected.longitude
          };
          coordinates.push(oposite);
        }
        coordinates.push(selected);
      }
      this.map.fitToCoordinates(coordinates, options);
    }
  };

  reportSelection = () => {
    this.createReport(this.state.selectedAlerts);
  };

  reportArea = () => {
    this.createReport([...this.state.selectedAlerts, ...this.state.neighbours]);
  };

  createReport = selectedAlerts => {
    this.props.setCanDisplayAlerts(false);
    const { area } = this.props;
    let latLng = [];
    if (selectedAlerts && selectedAlerts.length > 0) {
      latLng = selectedAlerts.map(alert => ({
        lat: alert.latitude,
        lon: alert.longitude
      }));
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

  onRegionChange = region => {
    if (this.state.customReporting && !this.isRouteTracking()) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          title: {
            text: formatCoordsByFormat(region, this.props.coordinatesFormat)
          }
        }
      });
    }
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
    const zoomScale = clusterGenerator.clusters.getClusterExpansionZoom(id) - 1;
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

  renderButtonPanelSelected() {
    const { lastPosition, locationError } = this.state;

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
          <CircleButton shouldFillContainer onPress={this.reportSelection} light icon={createReportIcon} />
          {lastPosition ? (
            <CircleButton shouldFillContainer onPress={this.fitPosition} light icon={myLocationIcon} />
          ) : null}
          {!this.isRouteTracking() ? (
            <CircleButton light icon={closeIcon} style={styles.btnLeft} onPress={this.onSelectionCancelPress} />
          ) : null}
          <CircleButton
            shouldFillContainer
            onPress={this.isRouteTracking() ? this.onStopTrackingPressed : this.onStartTrackingPressed}
            light
            icon={this.isRouteTracking() ? stopTrackingIcon : startTrackingIcon}
          />
        </View>
      </React.Fragment>
    );
  }

  renderButtonPanel() {
    const { lastPosition, locationError } = this.state;

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <View style={styles.buttonPanel}>
        <CircleButton shouldFillContainer onPress={this.onCustomReportingPress} icon={addLocationIcon} />
        <LocationErrorBanner
          style={{ marginRight: 16, marginLeft: lastPosition ? 16 : 0 }}
          locationError={locationError}
          mostRecentLocationTime={lastPosition?.timestamp}
        />
        {lastPosition ? (
          <CircleButton shouldFillContainer onPress={this.fitPosition} light icon={myLocationIcon} />
        ) : null}
      </View>
    );
  }

  renderMapFooter() {
    const { selectedAlerts, neighbours, customReporting } = this.state;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;

    const hasNeighbours = neighbours && neighbours.length > 0;
    let veilHeight = 120;
    if (hasAlertsSelected) veilHeight = hasNeighbours ? 260 : 180;

    return [
      <View key="bg" pointerEvents="none" style={[styles.footerBGContainer, { height: veilHeight }]}>
        <Image style={[styles.footerBg, { height: veilHeight }]} source={backgroundImage} />
      </View>,
      <FooterSafeAreaView key="footer" pointerEvents="box-none" style={styles.footer}>
        {hasAlertsSelected || customReporting || this.isRouteTracking()
          ? this.renderButtonPanelSelected()
          : this.renderButtonPanel()}
        <MapAttribution />
      </FooterSafeAreaView>
    ];
  }

  renderRouteTrackingDialog() {
    return this.state.routeTrackingDialogState !== ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN ? (
      <BottomDialog
        title={'Stop Route Tracking'}
        closeDialog={this.closeBottomDialog}
        buttons={[
          ...(this.state.routeTrackingDialogState === ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING
            ? [
                {
                  text: 'continue route tracking',
                  onPress: () => Navigation.pop(this.props.componentId),
                  buttonProps: {}
                }
              ]
            : []),
          { text: 'stop and save route', onPress: this.openSaveRouteScreen, buttonProps: { transparent: true } },
          {
            text: 'stop and delete route',
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
    const { lastPosition, compassLine, customReporting, selectedAlerts, neighbours, heading, markers } = this.state;

    const {
      areaCoordinates,
      area,
      contextualLayer,
      isConnected,
      route,
      isOfflineMode,
      ctxLayerLocalTilePath
    } = this.props;
    const showCompassLine = lastPosition && selectedAlerts && compassLine && !this.isRouteTracking();
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;
    const isIOS = Platform.OS === 'ios';
    const ctxLayerKey =
      isIOS && contextualLayer ? `contextualLayerElement-${contextualLayer.name}` : 'contextualLayerElement';
    const keyRand = isIOS ? Math.floor(Math.random() * 100 + 1) : '';
    const clustersKey = markers
      ? `clustersElement-${clusterGenerator.activeClusterId}_${markers.activeMarkersId}`
      : 'clustersElement';
    const markerSize = this.getMarkerSize();
    const markerBorder = { borderWidth: (markerSize.width / 18) * 4 };

    // Map elements

    const contextualLocalLayerElement = ctxLayerLocalTilePath ? (
      <MapView.LocalTile
        key={`${ctxLayerKey}_local`}
        pathTemplate={ctxLayerLocalTilePath}
        zIndex={1}
        maxZoom={12}
        tileSize={256}
      />
    ) : null;
    const contextualRemoteLayerElement =
      contextualLayer && !isOfflineMode ? ( // eslint-disable-line
        <MapView.UrlTile key={ctxLayerKey} urlTemplate={contextualLayer.url} zIndex={2} />
      ) : null;
    const compassLineElement = showCompassLine ? (
      <MapView.Polyline
        key="compassLineElement"
        coordinates={compassLine}
        strokeColor={Theme.colors.color5}
        strokeWidth={2}
        zIndex={3}
      />
    ) : null;
    const areaPolygonElement = areaCoordinates ? (
      <MapView.Polyline
        key="areaPolygonElement"
        coordinates={areaCoordinates}
        strokeColor={Theme.colors.color1}
        strokeWidth={2}
        zIndex={3}
      />
    ) : null;

    // In the userPositionElement, if we do not track view changes on iOS the position marker will not render.
    // However, on Android it needs to be set to false as to resolve memory leaks. In the future, we need to revisit this and hopefully we can remove it altogether.
    const userPositionElement = lastPosition ? (
      <MapView.Marker.Animated
        key="userPositionElement"
        image={markerImage}
        coordinate={lastPosition}
        style={{ zIndex: 10 }}
        anchor={{ x: 0.5, y: 0.5 }}
        pointerEvents={'none'}
        tracksViewChanges={Platform.OS === 'ios' ? true : false}
      />
    ) : null;
    const compassElement =
      lastPosition && heading !== null ? (
        <MapView.Marker
          key="compassElement"
          coordinate={lastPosition}
          zIndex={11}
          anchor={{ x: 0.5, y: 0.5 }}
          pointerEvents={'none'}
        >
          <Image
            style={{
              width: 94,
              height: 94,
              transform: [{ rotate: `${heading || '0'}deg` }]
            }}
            source={compassImage}
          />
        </MapView.Marker>
      ) : null;
    const neighboursAlertsElement =
      neighbours && neighbours.length > 0
        ? neighbours.map((neighbour, i) => (
            <MapView.Marker
              key={`neighboursAlertsElement-${i}-${keyRand}`}
              coordinate={neighbour}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => this.includeNeighbour(neighbour)}
              zIndex={10}
              tracksViewChanges={false}
            >
              <View style={[markerSize, markerBorder, styles.markerIconArea]} />
            </MapView.Marker>
          ))
        : null;
    const selectedAlertsElement =
      hasAlertsSelected && !customReporting && !this.isRouteTracking()
        ? selectedAlerts.map((alert, i) => (
            <MapView.Marker
              key={`selectedAlertsElement-${i}-${keyRand}`}
              coordinate={alert}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => this.removeSelection(alert)}
              zIndex={20}
              tracksViewChanges={false}
            >
              <View style={[markerSize, markerBorder, styles.selectedMarkerIcon]} />
            </MapView.Marker>
          ))
        : null;

    const clustersElement =
      area && area.dataset ? (
        <Clusters
          key={clustersKey}
          markers={markers}
          selectAlert={this.selectAlert}
          zoomTo={this.zoomTo}
          datasetSlug={area.dataset.slug}
          markerSize={markerSize}
        />
      ) : null;

    const customReportingElement =
      this.state.customReporting && !this.isRouteTracking() ? (
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

    return (
      <View style={containerStyle} onMoveShouldSetResponder={this.onMoveShouldSetResponder}>
        <View pointerEvents="none" style={styles.header}>
          <Image style={styles.headerBg} source={backgroundImage} />
          {!isConnected && (
            <SafeAreaView>
              <Text style={styles.offlineNotice}>
                {isOfflineMode ? i18n.t('settings.offlineMode') : i18n.t('commonText.connectionRequiredTitle')}
              </Text>
            </SafeAreaView>
          )}
        </View>
        <MapView
          ref={ref => {
            this.map = ref;
          }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapPadding={Platform.OS === 'android' ? { top: 40, bottom: 0, left: 0, right: 0 } : undefined}
          mapType="none"
          minZoomLevel={2}
          maxZoomLevel={18}
          showsCompass
          rotateEnabled
          moveOnMarkerPress={false}
          onMapReady={this.onMapReady}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplete}
        >
          <Basemap areaId={area.id} />
          {contextualLocalLayerElement}
          {contextualRemoteLayerElement}
          {clustersElement}
          {compassLineElement}
          <RouteMarkers
            isTracking={this.isRouteTracking()}
            route={route}
          />
          {areaPolygonElement}
          {neighboursAlertsElement}
          {selectedAlertsElement}
          {userPositionElement}
          {compassElement}
        </MapView>
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
