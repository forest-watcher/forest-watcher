// @flow
import React, { Component } from 'react';

import {
  Animated,
  Alert,
  AppState,
  BackHandler,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  Text,
  View
} from 'react-native';
import * as Sentry from '@sentry/react-native';

import { LOCATION_TRACKING, REPORTS, MAPS } from 'config/constants';
import throttle from 'lodash/throttle';
import isEqual from 'lodash/isEqual';
import toUpper from 'lodash/toUpper';
import kebabCase from 'lodash/kebabCase';
import deburr from 'lodash/deburr';
import moment from 'moment';

import CircleButton from 'components/common/circle-button';
import BottomDialog from 'components/map/bottom-dialog';
import LocationErrorBanner from 'components/map/locationErrorBanner';
import { formatCoordsByFormat, getPolygonBoundingBox } from 'helpers/map';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import Theme from 'config/theme';
import i18n from 'i18next';
import styles, { mapboxStyles } from './styles';
import { Navigation } from 'react-native-navigation';
import SafeArea, { withSafeArea } from 'react-native-safe-area';
import MapboxGL from '@react-native-mapbox-gl/maps';

import { toFileUri } from 'helpers/fileURI';

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
  getCoordinateAndDistanceText,
  coordsObjectToArray,
  coordsArrayToObject,
  isValidLatLng,
  isValidLatLngArray
} from 'helpers/location';
import RouteMarkers from 'components/map/route';
import type { Basemap } from 'types/basemaps.types';
import type { Route } from 'types/routes.types';
import type { File } from 'types/file.types';
import InfoBanner from 'components/map/info-banner';
import type { LayerSettings } from 'types/layerSettings.types';
import Alerts from 'containers/map/alerts';
import { formatInfoBannerDate } from 'helpers/date';
import Reports from 'containers/map/reports';
import { initialWindowSafeAreaInsets } from 'react-native-safe-area-context';
import { lineString } from '@turf/helpers';

const emitter = require('tiny-emitter/instance');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 5;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN = 0;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING = 1;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_STOPPING = 2;

const DISMISSED_INFO_BANNER_POSTIION = 200 + initialWindowSafeAreaInsets.bottom;

/**
 * Elapsed time in milliseconds after which we should consider the most recent location "stale", presumably because we
 * were unable to obtain a GPS fix
 *
 * @type {number}
 */
const STALE_LOCATION_THRESHOLD = LOCATION_TRACKING.interval * 3;

const backButtonImage = require('assets/back.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const mapSettingsIcon = require('assets/map_settings.png');
const startTrackingIcon = require('assets/startTracking.png');
const stopTrackingIcon = require('assets/stopTracking.png');
const myLocationIcon = require('assets/my_location.png');
const createReportIcon = require('assets/createReport.png');
const reportAreaIcon = require('assets/report_area.png');
const addLocationIcon = require('assets/add_location.png');
const customReportingMarker = require('assets/custom-reporting-marker.png');
const userLocationBearingImage = require('assets/userLocationBearing.png');
const userLocationImage = require('assets/userLocation.png');
const closeIcon = require('assets/close_gray.png');

type Props = {
  componentId: string,
  createReport: Object => {},
  ctxLayerLocalTilePath?: string,
  areaCoordinates: [number, number],
  getImportedContextualLayersById: (Array<string>) => Array<File>,
  isConnected: boolean,
  isOfflineMode: boolean,
  setCanDisplayAlerts: boolean => {},
  canDisplayAlerts: boolean,
  area: Object,
  setActiveAlerts: () => {},
  contextualLayer: {
    id?: ?string,
    name?: ?string,
    url: string
  },
  coordinatesFormat: string,
  mapWalkthroughSeen: boolean,
  setSelectedAreaId: () => {},
  route: Route,
  allRouteIds: Array<string>,
  layerSettings: LayerSettings,
  isTracking: boolean,
  onStartTrackingRoute: () => {},
  onCancelTrackingRoute: () => {},
  getActiveBasemap: () => Basemap,
  getRoutesById: string => Array<Route>
};

class MapComponent extends Component<Props> {
  margin = Platform.OS === 'ios' ? 50 : 100;

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
            id: 'settings',
            icon: mapSettingsIcon
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
    this.onRegionDidChange = this.onRegionDidChange.bind(this);

    this.state = {
      bottomSafeAreaInset: 0,
      userLocation: null,
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
      mapCameraBounds: this.getMapCameraBounds(),
      destinationCoords: null,
      animatedPosition: new Animated.Value(DISMISSED_INFO_BANNER_POSTIION),
      infoBannerShowing: false,
      infoBannerProps: {
        title: '',
        subtitle: '',
        type: '',
        featureId: ''
      }
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

    const { setCanDisplayAlerts, canDisplayAlerts } = this.props;
    if (!canDisplayAlerts) {
      setCanDisplayAlerts(true);
    }

    this.showMapWalkthrough();
  }

  // called on startup to set initial camera position
  getMapCameraBounds = () => {
    const { route, areaCoordinates } = this.props;
    const bounds = getPolygonBoundingBox(route?.locations?.length ? route.locations : areaCoordinates);
    return { ...bounds, ...MAPS.smallPadding };
  };

  onLocationUpdateError = error => {
    this.setState({
      locationError: error.code
    });
  };

  showMapWalkthrough = () => {
    if (!this.props.mapWalkthroughSeen) {
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
                  modalPresentationStyle: 'overCurrentContext'
                }
              }
            }
          ]
        }
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { area, setActiveAlerts } = this.props;
    if (area && area.dataset) {
      const differentArea = area.id !== prevProps.area.id;
      const datasetChanged = !isEqual(area.dataset, prevProps.area.dataset);
      if (differentArea || datasetChanged) {
        setActiveAlerts();
        if (differentArea) {
          this.updateSelectedArea();
        }
      }
    }

    if (prevState.userLocation !== this.state.userLocation) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          title: {
            text: formatCoordsByFormat(this.state.userLocation, this.props.coordinatesFormat)
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
    emitter.off(GFWOnHeadingEvent, this.updateHeading);
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
    this.dismissInfoBanner();
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
    this.dismissInfoBanner();
    try {
      await this.geoLocate(true);
      this.props.onStartTrackingRoute(coordsArrayToObject(this.state.destinationCoords), this.props.area.id);

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
    this.dismissInfoBanner();
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

  async onRegionDidChange() {
    const destinationCoords = await this.map.getCenter();
    this.setState({ destinationCoords, dragging: false });
  }

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
          this.dismissInfoBanner();
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
      userLocation: location,
      locationError: null
    });
  }, 300);

  updateHeading = throttle(heading => {
    this.setState({ heading: parseInt(heading) });
  }, 150);

  onCustomReportingPress = debounceUI(() => {
    this.dismissInfoBanner();
    this.setState(prevState => ({
      customReporting: true
    }));
  });

  onSelectionCancelPress = debounceUI(() => {
    this.dismissInfoBanner();
    this.setState({
      customReporting: false,
      selectedAlerts: [],
      neighbours: []
    });
  });

  getFeatureId = () => {
    return this.props.route?.id || this.props.area.id;
  };

  onSettingsPress = debounceUI(() => {
    this.dismissInfoBanner();
    // If route has been opened, that is the current layer settings feature ID,
    // otherwise use the area ID
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        right: {
          visible: true,
          component: {
            passProps: {
              // https://github.com/wix/react-native-navigation/issues/3635
              // Pass componentId so drawer can push screens
              componentId: this.props.componentId,
              featureId: this.getFeatureId()
            }
          }
        }
      }
    });
  });

  // Zoom map to user location
  zoomToUserLocation = debounceUI(() => {
    this.dismissInfoBanner();
    const { userLocation } = this.state;
    if (userLocation) {
      this.mapCamera.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 16,
        animationDuration: 2000
      });
    }
  });

  reportSelection = debounceUI(() => {
    this.dismissInfoBanner();
    this.createReport(this.state.selectedAlerts);
  });

  reportArea = debounceUI(() => {
    this.dismissInfoBanner();
    this.createReport([...this.state.selectedAlerts, ...this.state.neighbours]);
  });

  createReport = selectedAlerts => {
    this.props.setCanDisplayAlerts(false);
    const { area } = this.props;
    const { userLocation } = this.state;
    let latLng = [];
    if (selectedAlerts && selectedAlerts.length > 0) {
      latLng = selectedAlerts.map(alert => ({
        lat: alert.latitude,
        lon: alert.longitude
      }));
    } else if (this.isRouteTracking() && userLocation) {
      latLng = [
        {
          lat: userLocation.latitude,
          lon: userLocation.longitude
        }
      ];
    }

    const userLatLng =
      this.state.userLocation && `${this.state.userLocation.latitude},${this.state.userLocation.longitude}`;
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

  updateSelectedArea = () => {
    this.setState({
      mapCameraBounds: this.getMapCameraBounds(),
      neighbours: [],
      selectedAlerts: []
    });
  };

  // Renders all active routes in layer settings
  renderAllRoutes = () => {
    const { activeRouteIds, showAll } = this.props.layerSettings.routes;
    let routeIds = showAll ? this.props.allRouteIds : activeRouteIds;
    // this is already being rendered as it is the selected feature
    routeIds = routeIds.filter(routeId => routeId !== this.getFeatureId());
    const routes = this.props.getRoutesById(routeIds);
    return routes.map(route => {
      return (
        <RouteMarkers
          key={route.id}
          isTracking={false}
          userLocation={null}
          route={route}
          selected={this.isRouteSelected(route.id)}
          onShapeSourcePressed={this.onShapeSourcePressed}
        />
      );
    });
  };

  isRouteSelected = routeId => {
    return this.state.infoBannerShowing && this.state.infoBannerProps.featureId === routeId;
  };

  // Renders all active imported contextual layers in settings
  renderImportedContextualLayers = () => {
    const layerIds = this.props.layerSettings.contextualLayers.activeContextualLayerIds;
    const layerFiles = this.props.getImportedContextualLayersById(layerIds);
    return (
      <React.Fragment>
        {layerFiles.map(layerFile => {
          return (
            <MapboxGL.ShapeSource
              key={layerFile.id}
              id={'imported_layer_' + layerFile.id}
              url={toFileUri(layerFile.path)}
            >
              <MapboxGL.SymbolLayer
                filter={['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false]}
                id={'imported_layer_symbol_' + layerFile.id}
                sourceID={'imported_layer_' + layerFile.id}
                style={mapboxStyles.icon}
              />
              <MapboxGL.LineLayer id={'imported_layer_line_' + layerFile.id} style={mapboxStyles.geoJsonStyleSpec} />
              <MapboxGL.FillLayer
                filter={['match', ['geometry-type'], ['LineString', 'MultiLineString'], false, true]}
                id={'imported_layer_fill_' + layerFile.id}
                style={mapboxStyles.geoJsonStyleSpec}
              />
            </MapboxGL.ShapeSource>
          );
        })}
      </React.Fragment>
    );
  };

  // Displays user location circle with direction heading on map
  renderUserLocation = () => {
    const userLocationStyle =
      this.state.heading != null
        ? {
            iconImage: userLocationBearingImage,
            // center of image should be the center of the user location circle
            iconOffset: [0, 10],
            iconAnchor: 'bottom',
            iconRotationAlignment: 'map',
            iconRotate: this.state.heading ?? 180
          }
        : {
            iconImage: userLocationImage
          };
    return (
      <MapboxGL.UserLocation renderMode="custom">
        <MapboxGL.SymbolLayer id="userLocation" style={userLocationStyle} />
      </MapboxGL.UserLocation>
    );
  };

  // Draw line from user location to destination
  renderDestinationLine = () => {
    const { destinationCoords, userLocation, customReporting } = this.state;
    if (!customReporting || !destinationCoords || !userLocation) {
      return null;
    }
    const bothValidLocations = isValidLatLngArray(destinationCoords) && isValidLatLng(userLocation);

    let line = null;
    if (bothValidLocations) {
      line = lineString([coordsObjectToArray(userLocation), destinationCoords]);
    }
    return (
      <MapboxGL.ShapeSource id="destLine" shape={line}>
        <MapboxGL.LineLayer id="destLineLayer" style={mapboxStyles.destinationLine} />
      </MapboxGL.ShapeSource>
    );
  };

  // Draw area polygon
  renderAreaOutline = () => {
    const coords = this.props.areaCoordinates?.map(coord => coordsObjectToArray(coord));
    if (!coords || coords.length < 2) {
      return null;
    }
    const line = lineString(coords);
    return (
      <MapboxGL.ShapeSource id="areaOutline" shape={line}>
        <MapboxGL.LineLayer id="areaOutlineLayer" style={mapboxStyles.areaOutline} />
      </MapboxGL.ShapeSource>
    );
  };

  renderButtonPanel() {
    const { customReporting, userLocation, locationError, neighbours, selectedAlerts, infoBannerProps } = this.state;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;
    const hasNeighbours = neighbours && neighbours.length > 0;
    const canReport = hasAlertsSelected || customReporting;
    const isRouteTracking = this.isRouteTracking();

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <React.Fragment>
        <LocationErrorBanner
          style={styles.locationErrorBanner}
          locationError={locationError}
          mostRecentLocationTime={userLocation?.timestamp}
        />
        <Animated.View style={{ transform: [{ translateY: this.state.animatedPosition }] }}>
          <InfoBanner style={styles.infoBanner} {...infoBannerProps} />
        </Animated.View>
        <View style={styles.buttonPanel}>
          {canReport ? (
            <React.Fragment>
              <CircleButton shouldFillContainer onPress={this.reportSelection} light icon={createReportIcon} />
              {hasNeighbours && <CircleButton shouldFillContainer onPress={this.reportArea} icon={reportAreaIcon} />}
            </React.Fragment>
          ) : (
            <CircleButton shouldFillContainer onPress={this.onCustomReportingPress} icon={addLocationIcon} />
          )}
          {userLocation ? (
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

  dismissInfoBanner = () => {
    // dismiss info banner
    this.setState({ infoBannerShowing: false });
    Animated.spring(this.state.animatedPosition, {
      toValue: DISMISSED_INFO_BANNER_POSTIION,
      velocity: 3,
      tension: 2,
      friction: 8
    }).start();
  };

  onClusterPress = async coords => {
    this.dismissInfoBanner();
    const zoom = await this.map.getZoom();
    if (coords && zoom) {
      this.mapCamera.setCamera({
        centerCoordinate: coords,
        zoomLevel: zoom + 3,
        animationDuration: 2000
      });
    }
  };

  onShapeSourcePressed = e => {
    // show info banner with feature details
    const { date, name, type, featureId, cluster } = e?.nativeEvent?.payload?.properties;
    if (cluster) {
      this.onClusterPress(e?.nativeEvent?.payload?.geometry?.coordinates);
      return;
    }
    if (date && name) {
      this.setState({
        infoBannerShowing: true,
        infoBannerProps: {
          title: name,
          subtitle: formatInfoBannerDate(date, type),
          type,
          featureId
        }
      });
      // show info banner
      Animated.spring(this.state.animatedPosition, {
        toValue: 0,
        velocity: 3,
        tension: 2,
        friction: 8
      }).start();
    }
  };

  render() {
    if (!this.props.area?.id) {
      // This is so that react native fast refresh doesnt crash the app.
      Navigation.pop(this.props.componentId);
      return null;
    }

    const { customReporting, userLocation, destinationCoords } = this.state;
    const { isConnected, isOfflineMode, route, coordinatesFormat, getActiveBasemap, layerSettings } = this.props;

    const basemap = getActiveBasemap(this.getFeatureId());

    const coordinateAndDistanceText = customReporting
      ? getCoordinateAndDistanceText(destinationCoords, userLocation, route, coordinatesFormat, this.isRouteTracking())
      : '';

    // Map elements
    const renderCustomReportingMarker = customReporting ? (
      <View
        pointerEvents="none"
        style={[styles.customLocationFixed, this.state.dragging ? styles.customLocationTransparent : '']}
      >
        <Image style={[Theme.icon, styles.customLocationMarker]} source={customReportingMarker} />
      </View>
    ) : null;

    // Controls view of map (location / zoom)
    const renderMapCamera = (
      <MapboxGL.Camera
        ref={ref => {
          this.mapCamera = ref;
        }}
        maxZoomLevel={19}
        bounds={this.state.mapCameraBounds}
        animationDuration={0}
      />
    );

    const containerStyle = this.state.layoutHasForceRefreshed
      ? [styles.container, styles.forceRefresh]
      : styles.container;

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
            <Text style={styles.coordinateText}>{coordinateAndDistanceText}</Text>
          </SafeAreaView>
        </View>
        <MapboxGL.MapView
          ref={ref => {
            this.map = ref;
          }}
          style={styles.mapView}
          styleURL={basemap.styleURL}
          onRegionDidChange={this.onRegionDidChange}
          onPress={this.dismissInfoBanner}
          compassViewMargins={{ x: 5, y: 50 }}
        >
          {renderMapCamera}
          {this.renderAreaOutline()}
          {layerSettings.routes.layerIsActive && this.renderAllRoutes()}
          {layerSettings.contextualLayers.layerIsActive && (
            <React.Fragment>{this.renderImportedContextualLayers()}</React.Fragment>
          )}
          {this.renderDestinationLine()}
          <Alerts
            featureId={this.getFeatureId()}
            areaId={this.props.area.id}
            onShapeSourcePressed={this.onShapeSourcePressed}
          />
          <Reports featureId={this.getFeatureId()} onShapeSourcePressed={this.onShapeSourcePressed} />
          <RouteMarkers
            isTracking={this.isRouteTracking()}
            userLocation={userLocation}
            route={route}
            selected={this.isRouteSelected(route?.id)}
            onShapeSourcePressed={this.onShapeSourcePressed}
          />
          {this.renderUserLocation()}
        </MapboxGL.MapView>
        {renderCustomReportingMarker}
        {this.renderMapFooter()}
        {this.renderRouteTrackingDialog()}
      </View>
    );
  }
}

export default MapComponent;
