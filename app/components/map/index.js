// @flow
import React, { Component, type Node } from 'react';

import type { SelectedAlert } from 'types/alerts.types';
import type { Basemap } from 'types/basemaps.types';
import type {
  AlertFeatureProperties,
  Coordinates,
  CoordinatesFormat,
  MapboxFeaturePressEvent,
  MapItemFeatureProperties,
  ReportFeatureProperties,
  RouteFeatureProperties
} from 'types/common.types';
import type { LocationPoint, Route } from 'types/routes.types';
import type { BasicReport, ReportArea, SelectedReport } from 'types/reports.types';
import type { LayerSettings } from 'types/layerSettings.types';

import {
  Animated,
  Alert as RNAlert,
  AppState,
  BackHandler,
  Image,
  LayoutAnimation,
  Platform,
  Text,
  View
} from 'react-native';
import * as Sentry from '@sentry/react-native';

import { DATASETS, REPORTS, MAPS } from 'config/constants';
import throttle from 'lodash/throttle';
import toUpper from 'lodash/toUpper';
import kebabCase from 'lodash/kebabCase';
import deburr from 'lodash/deburr';
import moment from 'moment';
import uniqBy from 'lodash/uniqBy';

import BottomDialog from 'components/map/bottom-dialog';

import { closestFeature, formatCoordsByFormat, getPolygonBoundingBox } from 'helpers/map';
import { pathForMBTilesFile } from 'helpers/layer-store/layerFilePaths';
import debounceUI from 'helpers/debounceUI';
import { trackScreenView, type ReportingSource } from 'helpers/analytics';
import Theme from 'config/theme';
import i18n from 'i18next';
import styles, { mapboxStyles } from './styles';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { MBTilesSource } from 'react-native-mbtiles';
import { initialWindowSafeAreaInsets } from 'react-native-safe-area-context';

const SafeAreaView = withSafeArea(View, 'margin', 'top');

import {
  GFWLocationAuthorizedAlways,
  GFWLocationAuthorizedInUse,
  GFWOnLocationEvent,
  GFWOnHeadingEvent,
  GFWOnErrorEvent,
  showAppSettings,
  showLocationSettings,
  startTrackingLocation,
  stopTrackingLocation,
  startTrackingHeading,
  stopTrackingHeading,
  getCoordinateAndDistanceText,
  coordsObjectToArray,
  coordsArrayToObject,
  type GFWLocationError
} from 'helpers/location';
import { isValidLatLng, isValidLatLngArray } from 'helpers/validation/location';

import ContextualLayers from 'containers/map/contextual-layers';
import RouteMarkers from 'components/map/route';

import Alerts from 'components/map/alerts';
import Reports from 'containers/map/reports';
import Footer from 'components/map/footer';
import { lineString, type Feature, type Geometry, type Position } from '@turf/helpers';
import { showMapWalkthrough } from 'screens/maps';

const emitter = require('tiny-emitter/instance');

const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN = 0;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_EXITING = 1;
const ROUTE_TRACKING_BOTTOM_DIALOG_STATE_STOPPING = 2;

const DISMISSED_INFO_BANNER_POSTIION = 200 + initialWindowSafeAreaInsets.bottom;

const backgroundImage = require('assets/map_bg_gradient.png');

const customReportingMarker = require('assets/custom-reporting-marker.png');
const userLocationBearingImage = require('assets/userLocationBearing.png');
const userLocationImage = require('assets/userLocation.png');

type Props = {
  componentId: string,
  createReport: (BasicReport, ReportingSource) => void,
  areaCoordinates: ?$ReadOnlyArray<Coordinates>,
  isConnected: boolean,
  isOfflineMode: boolean,
  reportedAlerts: $ReadOnlyArray<string>,
  featureId: ?string,
  area: ?ReportArea,
  coordinatesFormat: CoordinatesFormat,
  mapWalkthroughSeen: boolean,
  route: ?Route,
  routes: $ReadOnlyArray<Route>,
  layerSettings: LayerSettings,
  isTracking: boolean,
  onStartTrackingRoute: (location: Coordinates) => void,
  onCancelTrackingRoute: () => void,
  basemap: Basemap
};

type State = {
  userLocation: ?LocationPoint,
  heading: ?number,
  hasHeadingReadingFromCompass: boolean,
  selectedAlerts: $ReadOnlyArray<SelectedAlert>,
  selectedReports: $ReadOnlyArray<SelectedReport>,
  customReporting: boolean,
  dragging: boolean,
  layoutHasForceRefreshed: boolean,
  routeTrackingDialogState: number,
  locationError: ?number,
  mapCameraBounds: any,
  mapCenterCoords: ?[number, number],
  animatedPosition: any,
  infoBannerShowing: boolean,
  // feature(s) that the user has just tapped on
  tappedOnFeatures: $ReadOnlyArray<MapItemFeatureProperties>
};

class MapComponent extends Component<Props, State> {
  static offlinePortNumber = 49333;

  margin = Platform.OS === 'ios' ? 50 : 100;

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

  mapCamera: ?MapboxGL.Camera = null;
  map: ?MapboxGL.MapView = null;

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);

    this.state = {
      userLocation: null,
      heading: null,
      hasHeadingReadingFromCompass: false,
      selectedAlerts: [],
      selectedReports: [],
      customReporting: false,
      dragging: false,
      layoutHasForceRefreshed: false,
      routeTrackingDialogState: ROUTE_TRACKING_BOTTOM_DIALOG_STATE_HIDDEN,
      locationError: null,
      mapCameraBounds: this.getMapCameraBounds(),
      mapCenterCoords: null,
      animatedPosition: new Animated.Value(DISMISSED_INFO_BANNER_POSTIION),
      infoBannerShowing: false,
      tappedOnFeatures: []
    };
  }

  navigationButtonPressed({ buttonId }: { buttonId: NavigationButtonPressedEvent }) {
    if (buttonId === 'settings') {
      this.onSettingsPress();
    } else if (buttonId === 'backButton') {
      this.handleBackPress();
    }
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    AppState.addEventListener('change', this.handleAppStateChange);

    trackScreenView('Map');

    emitter.on(GFWOnHeadingEvent, this.updateHeading);
    emitter.on(GFWOnLocationEvent, this.updateLocationFromGeolocation);

    this.geoLocate();

    this.showMapWalkthroughIfNecessary();
  }

  // called on startup to set initial camera position
  getMapCameraBounds = () => {
    const { route, areaCoordinates } = this.props;
    const bounds = getPolygonBoundingBox(route && route.locations.length > 0 ? route.locations : areaCoordinates);
    return { ...bounds, ...MAPS.smallPadding };
  };

  onLocationUpdateError = (error: ?GFWLocationError) => {
    this.setState({
      locationError: error?.code
    });
  };

  showMapWalkthroughIfNecessary = () => {
    if (!this.props.mapWalkthroughSeen) {
      showMapWalkthrough();
    }
  };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.userLocation !== this.state.userLocation && this.state.userLocation) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          title: {
            text: formatCoordsByFormat(this.state.userLocation, this.props.coordinatesFormat)
          }
        }
      });
    }

    if (prevState.infoBannerShowing !== this.state.infoBannerShowing) {
      Animated.spring(this.state.animatedPosition, {
        toValue: this.state.infoBannerShowing ? 0 : DISMISSED_INFO_BANNER_POSTIION,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: false
      }).start();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);

    // If we're currently tracking a location, don't stop watching for updates!
    if (!this.isRouteTracking()) {
      stopTrackingLocation();
    }

    // Do remove the emitter listeners here, as we don't want this screen to receive anything while it's non-existent!
    emitter.off(GFWOnLocationEvent, this.updateLocationFromGeolocation);
    emitter.off(GFWOnHeadingEvent, this.updateHeading);
    emitter.off(GFWOnErrorEvent, this.onLocationUpdateError);
    stopTrackingHeading();
  }

  /**
   * Pause background location tracking while the map screen is backgrounded or inactive, UNLESS we are route tracking
   *
   * @param status
   */
  handleAppStateChange = (status: string) => {
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
      Navigation.pop('ForestWatcher.Map');
    }
    return true;
  });

  /**
   * geoLocate - Resets the location / heading event listeners, calling specific callbacks depending on whether we're tracking a route or not.
   */
  async geoLocate(trackWhenInBackground: boolean = this.isRouteTracking()) {
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

    // We have to determine what permission level to request.
    // On iOS 12 and below, and Android, we should base this on whether we need background permission.
    // However, on iOS 13, we should request always as we can't re-request later after requesting 'when in use'.
    const defaultPermissionLevel = trackWhenInBackground ? GFWLocationAuthorizedAlways : GFWLocationAuthorizedInUse;
    const requestedPermission =
      Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 13
        ? GFWLocationAuthorizedAlways
        : defaultPermissionLevel;

    try {
      await startTrackingLocation(requestedPermission);
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
    const routeDestination = this.getRouteDestination();

    if (!routeDestination) {
      return;
    }

    this.dismissInfoBanner();
    try {
      await this.geoLocate(true);
      this.props.onStartTrackingRoute(coordsArrayToObject(routeDestination));

      this.setState({ customReporting: false });

      emitter.on(GFWOnErrorEvent, this.onLocationUpdateError);
    } catch (err) {
      RNAlert.alert(
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

  // Used when starting a new route
  getRouteDestination = (): ?[number, number] => {
    const { selectedAlerts, selectedReports } = this.state;
    if (selectedAlerts?.length) {
      const lastSelectedAlert = selectedAlerts[this.state.selectedAlerts.length - 1];
      return [lastSelectedAlert.long, lastSelectedAlert.lat];
    } else if (selectedReports?.length) {
      return [selectedReports[0].long, selectedReports[0].lat];
    }
    return this.state.mapCenterCoords;
  };

  openSaveRouteScreen = debounceUI(() => {
    this.closeBottomDialog();
    Navigation.push('ForestWatcher.Map', {
      component: {
        name: 'ForestWatcher.SaveRoute'
      }
    });
  });

  onRegionDidChange = async () => {
    if (this.map) {
      const mapCenterCoords = await this.map.getCenter();
      this.setState({ mapCenterCoords, dragging: false });
    }
  };

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
    RNAlert.alert(i18n.t('routes.confirmDeleteTitle'), i18n.t('routes.confirmDeleteMessage'), [
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
  updateLocationFromGeolocation = throttle((location: LocationPoint) => {
    this.setState({
      userLocation: location,
      locationError: null
    });
  }, 300);

  updateHeading = throttle((heading: number, isFromGps: boolean = false) => {
    if (!heading) {
      return;
    }
    if (!isFromGps) {
      // Use heading reading from sensor if we are getting that data
      this.setState({ heading: parseInt(heading), hasHeadingReadingFromCompass: true });
    } else if (!this.state.hasHeadingReadingFromCompass) {
      // Otherwise use gps reading, provided by mapbox
      this.setState({ heading: parseInt(heading) });
    }
  }, 50);

  onCustomReportingPress = debounceUI(() => {
    this.dismissInfoBanner();
    this.setState({ customReporting: true });
  });

  onSelectionCancelPress = debounceUI(() => {
    this.dismissInfoBanner();
    this.setState({
      customReporting: false,
      selectedAlerts: [],
      selectedReports: []
    });
  });

  onSettingsPress = debounceUI(() => {
    this.dismissInfoBanner();
    // If route has been opened, that is the current layer settings feature ID,
    // otherwise use the area ID
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        right: {
          visible: true
        }
      }
    });
  });

  // Zoom map to user location
  zoomToUserLocation = debounceUI(() => {
    this.dismissInfoBanner();
    const { userLocation } = this.state;
    if (userLocation && this.mapCamera) {
      this.mapCamera.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 16,
        animationDuration: 2000
      });
    }
  });

  reportSelection = debounceUI(() => {
    this.dismissInfoBanner();
    this.createReport(this.state.selectedAlerts, this.state.selectedReports?.[0]);
  });

  reportArea = debounceUI(() => {
    this.dismissInfoBanner();
    this.createReport([...this.state.selectedAlerts]);
  });

  determineReportingSource = (
    selectedAlerts: $ReadOnlyArray<SelectedAlert>,
    isRouteTracking: boolean,
    isCustomReporting: boolean
  ): ReportingSource => {
    if (isCustomReporting) {
      return isRouteTracking ? 'customWhileRouting' : 'custom';
    }

    if (selectedAlerts?.length > 0) {
      return selectedAlerts.length === 1 ? 'singleAlert' : 'alertGroup';
    }

    return 'currentLocation';
  };

  determineReportingDatasetId = (selectedAlerts: $ReadOnlyArray<SelectedAlert>): ?string => {
    const alertsWithDataset: Array<SelectedAlert> = selectedAlerts.filter(alert => !!alert.datasetId);
    if (!alertsWithDataset.length) {
      return null;
    }
    const uniqueDatasetAlerts: Array<SelectedAlert> = uniqBy(alertsWithDataset, alert => {
      return alert.datasetId;
    });
    return uniqueDatasetAlerts
      .map(alert => {
        return DATASETS[alert.datasetId ?? '']?.reportNameId ?? '';
      })
      .join('|');
  };

  createReport = (selectedAlerts: $ReadOnlyArray<SelectedAlert>, selectedReport: ?SelectedReport) => {
    const { area } = this.props;
    const { userLocation, customReporting, mapCenterCoords } = this.state;

    if (!area) {
      console.warn('3SC', 'Cannot create a report without an area');
      return;
    }

    let latLng = [];
    if (customReporting) {
      if (!mapCenterCoords) {
        console.warn('3SC', 'Cannot create a custom report without map center coords');
        return;
      }

      latLng = [
        {
          lat: mapCenterCoords[1],
          lon: mapCenterCoords[0]
        }
      ];
    } else if (selectedAlerts && selectedAlerts.length > 0) {
      latLng = selectedAlerts.map(alert => ({
        lat: alert.lat,
        lon: alert.long
      }));
    } else if (selectedReport) {
      latLng = [
        {
          lat: selectedReport.lat,
          lon: selectedReport.long
        }
      ];
    } else if (this.isRouteTracking() && userLocation) {
      latLng = [
        {
          lat: userLocation.latitude,
          lon: userLocation.longitude
        }
      ];
    }

    const source = this.determineReportingSource(selectedAlerts, this.isRouteTracking(), customReporting);

    const userLatLng =
      this.state.userLocation && `${this.state.userLocation.latitude},${this.state.userLocation.longitude}`;
    const datasetId = this.determineReportingDatasetId(selectedAlerts);
    const reportedDataset = datasetId ? `-${datasetId}` : '';
    const areaName = toUpper(kebabCase(deburr(area.name)));
    const reportName = `${areaName}${reportedDataset}-REPORT--${moment().format('YYYY-MM-DDTHH:mm:ss')}`;
    this.props.createReport(
      {
        area,
        reportName,
        selectedAlerts,
        userPosition: userLatLng || REPORTS.noGpsPosition,
        clickedPosition: JSON.stringify(latLng)
      },
      source
    );

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

  // Renders all active routes in layer settings
  renderAllRoutes = (): Node => {
    const { activeRouteIds, showAll } = this.props.layerSettings.routes;
    const routes: $ReadOnlyArray<Route> = showAll
      ? this.props.routes
      : activeRouteIds.map(routeId => this.props.routes.find(route => route.id === routeId)).filter(Boolean);
    return routes
      .filter(route => route.id !== this.props.featureId)
      .map((route: Route) => {
        return (
          <RouteMarkers
            key={route.id}
            isTracking={false}
            userLocation={null}
            route={route}
            selected={this.isRouteSelected(route.id)}
            onShapeSourcePressed={this.onRouteFeaturesPressed}
          />
        );
      });
  };

  isRouteSelected = (routeId: ?string) => {
    return this.state.infoBannerShowing && this.state.tappedOnFeatures?.[0]?.featureId === routeId;
  };

  // Displays user location circle with direction heading on map
  renderUserLocation = () => {
    const userLocationStyle =
      this.state.heading != null
        ? {
            iconImage: userLocationBearingImage,
            iconAllowOverlap: true,
            // center of image should be the center of the user location circle
            iconOffset: [0, 10],
            iconAnchor: 'bottom',
            iconRotationAlignment: 'map',
            iconRotate: this.state.heading ?? 180
          }
        : {
            iconImage: userLocationImage,
            iconAllowOverlap: true
          };
    return (
      <MapboxGL.UserLocation
        onUpdate={location => this.updateHeading(location?.coords?.heading, true)}
        renderMode="custom"
      >
        <MapboxGL.SymbolLayer id="userLocation" style={userLocationStyle} />
      </MapboxGL.UserLocation>
    );
  };

  // Draw line from user location to destination
  renderDestinationLine = () => {
    const { mapCenterCoords, userLocation, customReporting } = this.state;
    if (!customReporting || !mapCenterCoords || !userLocation) {
      return null;
    }
    const bothValidLocations = isValidLatLngArray(mapCenterCoords) && isValidLatLng(userLocation);

    let line = null;
    if (bothValidLocations) {
      line = lineString([coordsObjectToArray(userLocation), mapCenterCoords]);
    }
    return (
      <MapboxGL.ShapeSource id="destLine" shape={line}>
        <MapboxGL.LineLayer id="destLineLayer" style={mapboxStyles.destinationLine} />
      </MapboxGL.ShapeSource>
    );
  };

  // Draw area polygon
  renderAreaOutline = () => {
    const coords = (this.props.areaCoordinates ?? []).map(coord => coordsObjectToArray(coord));
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
                  onPress: debounceUI(() => Navigation.pop('ForestWatcher.Map')),
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
    this.setState({
      infoBannerShowing: false
    });
  };

  onClusterPress = async (clusterFeature: Feature<Geometry, any>) => {
    this.dismissInfoBanner();

    let coords: ?Position = null;
    const clusterGeometry = clusterFeature.geometry;
    switch (clusterGeometry.type) {
      case 'Point': {
        coords = clusterGeometry.coordinates;
        break;
      }
      default: {
        break;
      }
    }

    if (coords && this.map) {
      const zoom = await this.map.getZoom();
      if (this.mapCamera) {
        this.mapCamera.setCamera({
          centerCoordinate: coords,
          zoomLevel: zoom + 3,
          animationDuration: 2000
        });
      }
    }
  };

  onAlertFeaturesPressed = (e: MapboxFeaturePressEvent<AlertFeatureProperties>) => {
    // if any of the features are a cluster - zoom in on the cluster so items will be moved apart
    const clusters = e.features.filter(feature => feature.properties?.cluster);
    if (clusters.length) {
      this.onClusterPress(clusters[0]);
      return;
    }
    const feature = closestFeature(e.features, e.coordinates);
    if (!feature) {
      return;
    }

    const alertProps: AlertFeatureProperties = feature.properties;
    const pressedAlert: SelectedAlert = {
      lat: Number(alertProps.lat),
      long: Number(alertProps.long),
      datasetId: alertProps.datasetId
    };
    const isAlert = alert => alert.lat === pressedAlert.lat && alert.long === pressedAlert.long;

    this.setState((prevState: State) => {
      const isAlertAlreadySelected = prevState.selectedAlerts.find(isAlert);
      const selectedAlerts = isAlertAlreadySelected
        ? prevState.selectedAlerts.filter(alert => !isAlert(alert))
        : [...prevState.selectedAlerts, pressedAlert];
      return {
        selectedReports: [], // deselect report if alert is tapped
        tappedOnFeatures: [alertProps],
        selectedAlerts: selectedAlerts,
        infoBannerShowing: selectedAlerts.length > 0
      };
    });
  };

  onReportFeaturesPressed = (e: MapboxFeaturePressEvent<ReportFeatureProperties>) => {
    const clusters = e.features.filter(feature => feature.properties?.cluster);
    if (clusters.length) {
      this.onClusterPress(clusters[0]);
      return;
    }

    const features: Array<ReportFeatureProperties> = (e.features ?? []).map(feature => feature.properties);

    if (features.length === 0) {
      return;
    }

    const pressedReports = features.map(feature => ({
      reportName: feature.featureId,
      lat: Number(feature.lat),
      long: Number(feature.long)
    }));

    // If none of the pressedReports are selected, then select them all
    // If all of the pressedReports are selected, then unselect them all
    // If some of the pressedReports are selected, then select the unselected ones

    this.setState((prevState: State) => {
      const newlySelectedReports = pressedReports.filter(
        pressedReport =>
          !prevState.selectedReports.some(selectedReport => pressedReport.reportName === selectedReport.reportName)
      );
      const selectedReports =
        newlySelectedReports.length > 0
          ? [...prevState.selectedReports, ...newlySelectedReports]
          : prevState.selectedReports.filter(
              report => !pressedReports.some(pressedReport => pressedReport.reportName === report.reportName)
            );

      return {
        selectedReports: selectedReports,
        selectedAlerts: [], // deselect alert if report is tapped
        infoBannerShowing: selectedReports.length > 0,
        tappedOnFeatures: features
      };
    });
  };

  onRouteFeaturesPressed = (e: MapboxFeaturePressEvent<RouteFeatureProperties>) => {
    const features: Array<RouteFeatureProperties> = (e.features ?? []).map(feature => feature.properties);

    if (features.length === 0) {
      return;
    }

    this.setState({
      infoBannerShowing: true,
      tappedOnFeatures: [features[0]]
    });
  };

  onMapPress = () => {
    this.dismissInfoBanner();
    this.setState({
      selectedAlerts: [],
      selectedReports: []
    });
  };

  render() {
    const { customReporting, userLocation, mapCenterCoords } = this.state;
    const { isConnected, isOfflineMode, route, coordinatesFormat, basemap, layerSettings, featureId } = this.props;

    if (!featureId) {
      return null;
    }

    const coordinateAndDistanceText = customReporting
      ? getCoordinateAndDistanceText(mapCenterCoords, userLocation, route, coordinatesFormat, this.isRouteTracking())
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
      <View style={containerStyle}>
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
          onPress={this.onMapPress}
          compassViewMargins={{ x: 5, y: 50 }}
        >
          {basemap.tileUrl && (
            <MapboxGL.RasterSource id="basemapTiles" url={basemap.tileUrl}>
              <MapboxGL.RasterLayer id="basemapTileLayer" />
            </MapboxGL.RasterSource>
          )}
          <MBTilesSource
            basemapId={basemap.id}
            basemapPath={basemap.isCustom ? pathForMBTilesFile(basemap) : null}
            belowLayerID={'areaOutlineLayer'}
            port={MapComponent.offlinePortNumber}
          />
          {renderMapCamera}
          {this.renderAreaOutline()}
          {layerSettings.routes.layerIsActive && this.renderAllRoutes()}
          {layerSettings.contextualLayers.layerIsActive && <ContextualLayers featureId={featureId} />}
          {this.renderDestinationLine()}
          <Alerts
            alertLayerSettings={this.props.layerSettings.alerts}
            areaId={this.props.area?.id}
            reportedAlerts={this.props.reportedAlerts}
            selectedAlerts={this.state.selectedAlerts}
            onShapeSourcePressed={this.onAlertFeaturesPressed}
          />
          <Reports
            featureId={featureId}
            onShapeSourcePressed={this.onReportFeaturesPressed}
            selectedReports={this.state.selectedReports}
          />
          <RouteMarkers
            isTracking={this.isRouteTracking()}
            userLocation={userLocation}
            route={route}
            selected={this.isRouteSelected(route?.id)}
            onShapeSourcePressed={this.onRouteFeaturesPressed}
          />
          {this.renderUserLocation()}
        </MapboxGL.MapView>
        {renderCustomReportingMarker}
        <Footer
          animatedPosition={this.state.animatedPosition}
          customReporting={this.state.customReporting}
          isRouteTracking={this.isRouteTracking()}
          locationError={this.state.locationError}
          onCustomReportingPress={this.onCustomReportingPress}
          onReportSelectionPress={this.reportSelection}
          onSelectionCancelPress={this.onSelectionCancelPress}
          onStartTrackingPress={this.onStartTrackingPressed}
          onStopTrackingPress={this.onStopTrackingPressed}
          onZoomToUserLocationPress={this.zoomToUserLocation}
          selectedAlerts={this.state.selectedAlerts}
          selectedReports={this.state.selectedReports}
          tappedOnFeatures={this.state.tappedOnFeatures}
          userLocation={this.state.userLocation}
        />
        {this.renderRouteTrackingDialog()}
      </View>
    );
  }
}

export default MapComponent;
