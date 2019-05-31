import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, Animated, Dimensions, Easing, Image, Linking, Platform, Text, View } from 'react-native';

import { MAPS, REPORTS } from 'config/constants';
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
import Clusters from 'containers/map/clusters';
import { formatCoordsByFormat, getDistanceFormattedText, getMapZoom, getNeighboursSelected } from 'helpers/map';
import tracker from 'helpers/googleAnalytics';
import clusterGenerator from 'helpers/clusters-generator';
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
  GFWLocationUnauthorized,
  GFWOnLocationEvent,
  GFWOnHeadingEvent,
  checkLocationStatus,
  requestAndroidLocationPermissions,
  getCurrentLocation,
  getValidLocations,
  startTrackingLocation,
  stopTrackingLocation,
  startTrackingHeading,
  stopTrackingHeading
} from 'helpers/location';
var emitter = require('tiny-emitter/instance');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 5;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const backButtonImage = require('assets/back.png');
const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
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
        style: 'dark'
      },
      topBar: {
        background: {
          color: 'transparent',
          translucent: true
        },
        backButton: {
          icon: backButtonImage,
          color: Theme.fontColors.white
        },
        drawBehind: true,
        title: {
          color: Theme.fontColors.white
        },
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
    const { center } = props;
    const initialCoords = center || { lat: MAPS.lat, lon: MAPS.lng };
    // Google maps lon and lat are inverted
    this.state = {
      lastPosition: null,
      hasCompass: false,
      compassLine: null,
      heading: null,
      geoMarkerOpacity: new Animated.Value(0.3),
      region: {
        latitude: initialCoords.lon,
        longitude: initialCoords.lat,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      markers: [],
      selectedAlerts: [],
      neighbours: [],
      mapZoom: 2,
      customReporting: false,
      dragging: false,
      layoutHasForceRefreshed: false
    };

    this.updateLocationFromGeolocation = this.updateLocationFromGeolocation.bind(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'settings') {
      this.onSettingsPress();
    }
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    this.animateGeo();
    this.geoLocate(this.props.routeDestination);
  }

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

    if (this.state.selectedAlerts !== prevState.selectedAlerts && !this.props.routeDestination) {
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
    // If we're currently tracking a location, don't stop watching for updates!
    if (!this.props.routeDestination) {
      stopTrackingLocation();
    }

    // Do remove the emitter listeners here, as we don't want this screen to receive anything while it's non-existent!
    emitter.off(GFWOnLocationEvent, this.updateLocationFromGeolocation);
    emitter.off(GFWOnHeadingEvent);
    stopTrackingHeading();

    this.props.setSelectedAreaId('');
  }

  animateGeo() {
    Animated.sequence([
      Animated.timing(this.state.geoMarkerOpacity, {
        toValue: 0.4,
        easing: Easing.in(Easing.quad),
        duration: 800
      }),
      Animated.timing(this.state.geoMarkerOpacity, {
        toValue: 0.15,
        easing: Easing.out(Easing.quad),
        duration: 1000
      })
    ]).start(event => {
      if (event.finished) {
        this.animateGeo();
      }
    });
  }

  /**
   * geoLocate - Resets the location / heading event listeners, calling specific callbacks depending on whether we're tracking a route or not.
   *
   * @param  {Location} routeDestination The location we're currently routing to.
   */
  async geoLocate(routeDestination) {
    // Remove any old emitters & stop tracking. We want to reset these to ensure the right functions are being called.
    emitter.off(GFWOnLocationEvent);
    emitter.off(GFWOnHeadingEvent);
    stopTrackingLocation();
    stopTrackingHeading();

    checkLocationStatus(result => {
      if (result.authorization === GFWLocationUnauthorized) {
        if (Platform.OS === 'android') {
          // todo: look at merging this permission request into the 'checkLocationStatus' function...
          requestAndroidLocationPermissions(() => {
            this.geoLocate();
          });
        }
        return;
      }

      // todo: fix issue where on first view of map, after giving permission no location is given.
      getCurrentLocation((latestLocation, error) => {
        if (error) {
          if (Platform.OS === 'android') {
            // todo: look at merging this permission request into the 'checkLocationStatus' function...
            requestAndroidLocationPermissions(() => {
              this.geoLocate();
            });
          }
          // todo: handle error.
          return;
        }
        this.updateLocationFromGeolocation(latestLocation);
      });

      emitter.on(GFWOnHeadingEvent, this.updateHeading);
      startTrackingHeading();

      if (routeDestination) {
        emitter.on(GFWOnLocationEvent, this.handleRouteTrackingUpdate);
      } else {
        emitter.on(GFWOnLocationEvent, this.updateLocationFromGeolocation);
      }

      startTrackingLocation(GFWLocationAuthorizedAlways, error => {
        // todo: handle error if returned.
      });
    });
  }

  /**
   * onStartTrackingPressed - When pressed, updates redux with the location we're routing to & changes event listeners.
   * If the user has not given 'always' location permissions, an alert is shown.
   */
  onStartTrackingPressed = () => {
    checkLocationStatus(result => {
      // We need to have the GFWLocationAuthorizedAlways authorization level so we can track in the background!
      // todo: translations!
      if (result.authorization !== GFWLocationAuthorizedAlways) {
        if (Platform.OS === 'android') {
          requestAndroidLocationPermissions();
        } else {
          Alert.alert(
            'Not authorized!',
            `We need to access your location, even in the background, while you're on a route.`,
            [
              { text: 'OK' },
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openURL('app-settings:');
                }
              }
            ]
          );
        }
        return;
      }

      this.props.onStartTrackingRoute(this.state.selectedAlerts[this.state.selectedAlerts.length - 1]);

      this.geoLocate(this.props.routeDestination);
    });
  };

  /**
   * onStopTrackingRoute - When pressed, updates redux to state we're no longer tracking a route & changes event listeners.
   */
  onStopTrackingPressed = () => {
    this.props.onStopTrackingRoute();
    this.geoLocate(this.props.routeDestination);

    // todo: add end route UI.
    // todo: handle deleting locations from database upon saving / deleting the route.
  };

  /**
   * handleRouteTrackingUpdate - Handles any location updates that arrive while the user is tracking a route.
   * It will update the user's position on the map, and then save the user's locations to the redux state so they can be rendered on the map.
   */
  handleRouteTrackingUpdate = location => {
    this.updateLocationFromGeolocation(location);
    getValidLocations((locations, error) => {
      if (error) {
        // todo: handle error
        return;
      }

      if (locations) {
        this.props.addLocationToRoute(location);

        this.setState({
          currentRouteLocations: locations
        });
      }
    });
  };

  /**
   * updateLocationFromGeolocation - Handles any location updates that arrive while the user is in 'passive' mode & is not actively tracking a route.
   */
  updateLocationFromGeolocation = throttle(location => {
    // this.props.addLocationToRoute(location);
    this.setState({
      lastPosition: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    });
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
    let fontSize;

    if (formattedCoords) {
      if (targetLocation && currentLocation) {
        headerText = `${formattedCoords}, ${getDistanceFormattedText(targetLocation, currentLocation, 30)}`;
      }

      fontSize = 16;
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
    const { coordinatesFormat, routeDestination } = this.props;

    // If we have selected alerts, and we're not currently tracking a route.
    if (selectedAlerts && selectedAlerts.length > 0 && !routeDestination) {
      const last = selectedAlerts.length - 1;
      const coordinates = {
        latitude: selectedAlerts[last].latitude,
        longitude: selectedAlerts[last].longitude
      };
      const coordinateText = formatCoordsByFormat(coordinates, coordinatesFormat);
      this.setLocationHeaderTitle(coordinateText, coordinates, lastPosition);
    } else if (routeDestination) {
      const coordinateText = formatCoordsByFormat(routeDestination, coordinatesFormat);
      this.setLocationHeaderTitle(coordinateText, routeDestination, lastPosition);
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
    if (this.state.customReporting && this.props.routeDestination === undefined) {
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

  // todo: merge this with the function below
  renderButtonPanelSelected() {
    const { lastPosition } = this.state;
    const { routeDestination } = this.props;

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <View style={styles.buttonPanel}>
        <CircleButton shouldFillContainer onPress={this.reportSelection} light icon={createReportIcon} />
        {lastPosition ? (
          <CircleButton shouldFillContainer onPress={this.fitPosition} light icon={myLocationIcon} />
        ) : (
          this.renderNoSignal()
        )}
        <CircleButton light icon={closeIcon} style={styles.btnLeft} onPress={this.onSelectionCancelPress} />
        {lastPosition ? (
          <CircleButton
            shouldFillContainer
            onPress={routeDestination ? this.onStopTrackingPressed : this.onStartTrackingPressed}
            light
            icon={routeDestination ? stopTrackingIcon : startTrackingIcon}
          />
        ) : null}
      </View>
    );
  }

  renderRouteTrackingButtonPanel() {
    const { lastPosition } = this.state;
    const { routeDestination } = this.props;

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <View style={styles.buttonPanel}>
        <CircleButton shouldFillContainer onPress={this.reportSelection} light icon={createReportIcon} />
        {lastPosition ? (
          <CircleButton shouldFillContainer onPress={this.fitPosition} light icon={myLocationIcon} />
        ) : (
          this.renderNoSignal()
        )}
        <CircleButton
          shouldFillContainer
          onPress={routeDestination ? this.onStopTrackingPressed : this.onStartTrackingPressed}
          light
          icon={routeDestination ? stopTrackingIcon : startTrackingIcon}
        />
      </View>
    );
  }

  renderButtonPanel() {
    const { lastPosition } = this.state;

    // To fix the missing signal text overflow rendering in reverse row
    // last to render will be on top of the others
    return (
      <View style={styles.buttonPanel}>
        <CircleButton shouldFillContainer onPress={this.onCustomReportingPress} icon={addLocationIcon} />
        {lastPosition ? (
          <CircleButton shouldFillContainer onPress={this.fitPosition} light icon={myLocationIcon} />
        ) : (
          this.renderNoSignal()
        )}
      </View>
    );
  }

  renderNoSignal() {
    return (
      <View pointerEvents="box-none" style={styles.signalNotice}>
        <View style={styles.geoLocationContainer}>
          <Image style={styles.marker} source={markerCompassRedImage} />
          <Animated.View style={[styles.geoLocation, { opacity: this.state.geoMarkerOpacity }]} />
        </View>
        <Text style={styles.signalNoticeText}>{i18n.t('alerts.noGPS')}</Text>
      </View>
    );
  }

  renderMapFooter() {
    const { selectedAlerts, neighbours, customReporting } = this.state;
    const { routeDestination } = this.props;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;

    const hasNeighbours = neighbours && neighbours.length > 0;
    let veilHeight = 120;
    if (hasAlertsSelected) veilHeight = hasNeighbours ? 260 : 180;

    return [
      <View key="bg" pointerEvents="none" style={[styles.footerBGContainer, { height: veilHeight }]}>
        <Image style={[styles.footerBg, { height: veilHeight }]} source={backgroundImage} />
      </View>,
      <FooterSafeAreaView key="footer" pointerEvents="box-none" style={styles.footer}>
        {routeDestination
          ? this.renderRouteTrackingButtonPanel()
          : hasAlertsSelected || customReporting
          ? this.renderButtonPanelSelected()
          : this.renderButtonPanel()}
        <MapAttribution />
      </FooterSafeAreaView>
    ];
  }

  onMoveShouldSetResponder = () => {
    // Hack to fix onPanDrag not working for iOS when scroll enabled
    // https://github.com/react-community/react-native-maps/blob/master/docs/mapview.md
    this.setState({ dragging: true });
    return false;
  };

  render() {
    const {
      lastPosition,
      compassLine,
      region,
      customReporting,
      selectedAlerts,
      neighbours,
      heading,
      markers
    } = this.state;
    const {
      areaCoordinates,
      area,
      contextualLayer,
      basemapLocalTilePath,
      isConnected,
      routeDestination,
      isOfflineMode,
      ctxLayerLocalTilePath
    } = this.props;
    const showCompassLine = lastPosition && selectedAlerts && compassLine && !routeDestination;
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

    // todo: ensure that any route locations are rendered to the map.

    // Map elements
    const basemapLocalLayerElement = basemapLocalTilePath ? (
      <MapView.LocalTile
        key="localBasemapLayerElementL"
        pathTemplate={basemapLocalTilePath}
        zIndex={-2}
        maxZoom={12}
        tileSize={256}
      />
    ) : null;
    const basemapRemoteLayerElement = !isOfflineMode ? (
      <MapView.UrlTile key="basemapLayerElement" urlTemplate={MAPS.basemap} zIndex={-1} />
    ) : null;
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
      hasAlertsSelected && !customReporting && !routeDestination
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

    // todo: ensure that this is shown correctly.
    const routeDestinationElement = routeDestination ? (
      <MapView.Marker
        key={`routeDestination`}
        coordinate={routeDestination}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={20}
        tracksViewChanges={false}
      >
        <Image style={[Theme.icon, styles.customLocationMarker]} source={newAlertIcon} />
      </MapView.Marker>
    ) : null;
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
      this.state.customReporting && !routeDestination ? (
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
          initialRegion={region}
          showsCompass
          rotateEnabled
          moveOnMarkerPress={false}
          onMapReady={this.onMapReady}
          onRegionChange={this.onRegionChange}
          onRegionChangeComplete={this.onRegionChangeComplete}
        >
          {basemapLocalLayerElement}
          {basemapRemoteLayerElement}
          {contextualLocalLayerElement}
          {contextualRemoteLayerElement}
          {clustersElement}
          {compassLineElement}
          {areaPolygonElement}
          {neighboursAlertsElement}
          {routeDestinationElement}
          {selectedAlertsElement}
          {userPositionElement}
          {compassElement}
        </MapView>
        {customReportingElement}
        {this.renderMapFooter()}
      </View>
    );
  }
}

MapComponent.propTypes = {
  componentId: PropTypes.string.isRequired,
  createReport: PropTypes.func.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
  }),
  basemapLocalTilePath: PropTypes.string,
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
  routeDestination: PropTypes.shape({
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired
  }),
  onStartTrackingRoute: PropTypes.func.isRequired,
  onStopTrackingRoute: PropTypes.func.isRequired,
  addLocationToRoute: PropTypes.func.isRequired
};

export default MapComponent;
