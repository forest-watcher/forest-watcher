import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  Animated,
  Easing,
  StatusBar,
  Image,
  Text,
  Platform,
  PixelRatio
} from 'react-native';
import Config from 'react-native-config';
import CONSTANTS from 'config/constants';
import throttle from 'lodash/throttle';
import moment from 'moment';

import Theme from 'config/theme';
import { getAllNeighbours } from 'helpers/map';
import ActionBtn from 'components/common/action-button';
import AreaCarousel from 'containers/map/area-carousel/';
import Clusters from 'components/map/clusters/';
import tracker from 'helpers/googleAnalytics';
import I18n from 'locales';
import MapView from 'react-native-maps';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const Timer = require('react-native-timer');
const geoViewport = require('@mapbox/geo-viewport');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const basemap = PixelRatio.get() >= 2 ? CONSTANTS.maps.basemapHD : CONSTANTS.maps.basemap;
const URL_BASEMAP_TEMPLATE = `${basemap}?access_token=${Config.MAPBOX_TOKEN}`;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');

const saveReportIcon = require('assets/save_for_later.png');

function renderLoading() {
  return (
    <View style={[styles.container, styles.loader]}>
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size="large"
      />
    </View>
  );
}

function pointsFromCluster(cluster) {
  if (!cluster || !cluster.length > 0) return [];
  return cluster
    .filter((marker) => marker.properties.point_count === undefined)
    .map((feature) => ({
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    }));
}

function getNeighboursSelected(selectedAlerts, markers) {
  let neighbours = [];
  const screenPoints = pointsFromCluster(markers);

  selectedAlerts.forEach((alert) => {
    neighbours = [...neighbours, ...getAllNeighbours(alert, screenPoints)];
  });
  // Remove duplicates
  neighbours = neighbours.filter((alert, index, self) => (
    self.findIndex((t) => (t.latitude === alert.latitude && t.longitude === alert.longitude)) === index
  ));
  return neighbours;
}

class Map extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color5,
    navBarButtonColor: Theme.colors.color5,
    drawUnderNavBar: true,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarTransparent: true,
    navBarTranslucent: true
  };

  static navigatorButtons = {
    rightButtons: [
      { icon: saveReportIcon, id: 'contextualLayers' }
    ]
  };

  constructor(props) {
    super(props);
    const { center } = props;
    const initialCoords = center || { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };
    this.eventLocation = null;
    this.eventOrientation = null;
    this.hasSetCoordinates = false;
    // Google maps lon and lat are inverted
    this.state = {
      renderMap: false,
      lastPosition: null,
      hasCompass: false,
      compassFallback: null,
      heading: null,
      geoMarkerOpacity: new Animated.Value(0.3),
      region: {
        latitude: initialCoords.lon,
        longitude: initialCoords.lat,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      urlTile: null,
      markers: [],
      selectedAlerts: [],
      neighbours: []
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    if (Platform.OS === 'ios') {
      Location.requestWhenInUseAuthorization();
      StatusBar.setBarStyle('light-content');
    }

    this.geoLocate();
    this.updateMarkers();
    Timer.setTimeout(this, 'renderMap', this.renderMap, 500);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.selectedAlerts !== nextState.selectedAlerts && this.state.lastPosition !== null) {
      this.setCompassLine();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.areaCoordinates !== prevProps.areaCoordinates) {
      this.updateSelectedArea();
    }
    if (this.state.selectedAlerts !== prevState.selectedAlerts) {
      this.setHeaderTitle();
    }
  }

  componentWillUnmount() {
    Location.stopUpdatingLocation();

    Timer.clearTimeout(this, 'renderMap');
    if (this.eventLocation) {
      this.eventLocation.remove();
    }

    if (this.eventOrientation) {
      this.eventOrientation.remove();
    }

    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle('default');
      Location.stopUpdatingHeading();
    } else {
      SensorManager.stopOrientation();
    }
  }

  onNavigatorEvent(event) {
    switch (event.id) {
      case 'didAppear':
        this.onDidAppear();
        break;
      case 'contextualLayers':
        this.onContextualLayersPress();
        break;
      default:
    }
  }

  onContextualLayersPress = () => {
    this.props.navigator.toggleDrawer({
      side: 'right',
      animated: true
    });
  }

  onDidAppear = () => {
    const { actionsPending, syncModalOpen, syncSkip, setCanDisplayAlerts, canDisplayAlerts } = this.props;
    if (actionsPending > 0 && !syncModalOpen && !syncSkip && !this.syncModalOpen) {
      this.syncModalOpen = true;
      this.props.setSyncModal(true);
      this.props.navigator.showModal({
        screen: 'ForestWatcher.Sync',
        passProps: {
          goBackDisabled: true
        }
      });
    }
    if (!canDisplayAlerts) {
      setCanDisplayAlerts(true);
    }
  }

  onLayout = () => {
    if (this.hasSetCoordinates === false && this.props.areaCoordinates) {
      const margin = Platform.OS === 'ios' ? 150 : 250;
      const options = { edgePadding: { top: margin, right: margin, bottom: margin, left: margin }, animated: false };
      this.map.fitToCoordinates(this.props.areaCoordinates, options);
      this.hasSetCoordinates = true;
    }
  }

  getMapZoom() {
    const position = this.state.region;

    const bounds = [
      position.longitude - (position.longitudeDelta / 2),
      position.latitude - (position.latitudeDelta / 2),
      position.longitude + (position.longitudeDelta / 2),
      position.latitude + (position.latitudeDelta / 2)
    ];

    return geoViewport.viewport(bounds, [width, height], 0, 21, 256).zoom || 0;
  }

  setCompassLine = () => {
    this.setState((prevState) => {
      const state = {};
      if (prevState.selectedAlerts && prevState.selectedAlerts.length > 0) {
        const last = this.state.selectedAlerts.length - 1;
        // extract not needed props
        // eslint-disable-next-line no-unused-vars
        const { accuracy, altitude, speed, course, ...rest } = this.state.lastPosition;
        state.compassFallback = [{ ...rest }, { ...this.state.selectedAlerts[last] }];
      }
      if (prevState.compassFallback !== null && prevState.selectedAlerts.length === 0) {
        state.compassFallback = null;
      }
      return state;
    });
  }

  setHeaderTitle = () => {
    const { selectedAlerts } = this.state;
    const last = this.state.selectedAlerts.length - 1;
    const headerText = selectedAlerts && selectedAlerts.length > 0
      ? `${selectedAlerts[last].latitude.toFixed(4)}, ${selectedAlerts[last].longitude.toFixed(4)}`
      : I18n.t('dashboard.map');
    this.props.navigator.setTitle({
      title: headerText
    });
  }

  updateMarkers() {
    const clusters = this.props.cluster && this.props.cluster.getClusters([
      this.state.region.longitude - (this.state.region.longitudeDelta / 2),
      this.state.region.latitude - (this.state.region.latitudeDelta / 2),
      this.state.region.longitude + (this.state.region.longitudeDelta / 2),
      this.state.region.latitude + (this.state.region.latitudeDelta / 2)
    ], this.getMapZoom());
    const markers = clusters || [];
    this.setState({ markers });
  }

  reportSelection = () => {
    this.createReport(this.state.selectedAlerts);
  }

  reportArea = () => {
    this.createReport([...this.state.selectedAlerts, ...this.state.neighbours]);
  }

  createReport = (selectedAlerts) => {
    this.props.setCanDisplayAlerts(false);
    const { area } = this.props;
    let latLng = [];
    if (selectedAlerts && selectedAlerts.length > 0) {
      latLng = selectedAlerts.map((alert) => ({
        lat: alert.latitude,
        lon: alert.longitude
      }));
    }
    const screen = 'ForestWatcher.NewReport';
    const title = 'Report';
    const form = `${area.name.toUpperCase()}-${area.dataset.name}-REPORT--${moment().format('YYYY-MM-DDTHH:mm:ss')}`;
    this.props.createReport({
      area,
      name: form,
      userPosition: this.lastPosition || '0,0',
      clickedPosition: JSON.stringify(latLng)
    });
    this.props.navigator.push({
      screen,
      title,
      passProps: {
        screen,
        title,
        form
      }
    });
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

  geoLocate() {
    this.animateGeo();

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const coords = typeof location.coords !== 'undefined' ? location.coords : location;
        this.setState({
          lastPosition: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        });
      },
      (error) => console.info(error),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );

    Location.startUpdatingLocation();

    this.eventLocation = DeviceEventEmitter.addListener(
      'locationUpdated',
      throttle((location) => {
        const coords = typeof location.coords !== 'undefined' ? location.coords : location;
        const { lastPosition } = this.state;
        if (lastPosition && lastPosition.latitude !== coords.latitude &&
          lastPosition.longitude !== coords.longitude) {
          this.setState({ lastPosition: {
            latitude: coords.latitude,
            longitude: coords.longitude
          } });
        }
      }, 300)
    );

    const updateHeading = heading => (prevState) => {
      const state = {
        heading: parseInt(heading, 10)
      };
      if (!prevState.hasCompass) state.hasCompass = true;
      return state;
    };

    if (Platform.OS === 'ios') {
      Location.startUpdatingHeading();
      this.eventOrientation = DeviceEventEmitter.addListener(
        'headingUpdated',
        (data) => {
          this.setState(updateHeading(data.heading));
        }
      );
    } else {
      SensorManager.startOrientation(300);
      this.eventOrientation = DeviceEventEmitter.addListener(
        'Orientation',
        throttle((data) => {
          this.setState(updateHeading(data.azimuth));
        }, 16)
      );
    }
  }

  updateRegion = (region) => {
    this.setState({ region }, () => {
      this.updateMarkers();
    });
  }

  zoomScale = () => {
    const zoomLevel = this.getMapZoom();
    switch (true) {
      case zoomLevel < 6:
        return 16;
      case zoomLevel < 8:
        return 10;
      case zoomLevel < 10:
        return 8;
      case zoomLevel < 14:
        return 4;
      default:
        return 2;
    }
  }

  zoomTo = (coordinates) => {
    const zoomScale = this.zoomScale();
    const zoomCoordinates = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: this.state.region.latitudeDelta / zoomScale,
      longitudeDelta: this.state.region.longitudeDelta / zoomScale
    };
    this.map.animateToRegion(zoomCoordinates);
  }

  mapPress = (coordinate) => {
    const { selectedAlerts } = this.state;
    this.setState({
      neighbours: [],
      selectedAlerts: selectedAlerts && selectedAlerts.length > 0 ? [] : [coordinate]
    });
  }

  selectAlert = (coordinate) => {
    const { markers } = this.state;
    let selectedAlerts = [...this.state.selectedAlerts];
    let neighbours = [];
    if (coordinate) {
      if (selectedAlerts && selectedAlerts.length > 0) {
        selectedAlerts.push(coordinate);
      } else {
        selectedAlerts = [coordinate];
      }
      neighbours = getNeighboursSelected(selectedAlerts, markers);
      this.setState({
        neighbours,
        selectedAlerts
      });
    }
  }

  removeSelection = (coordinate) => {
    this.setState((state) => {
      let neighbours = [];
      if (state.selectedAlerts && state.selectedAlerts.length > 0) {
        const selectedAlerts = state.selectedAlerts.filter((alert) => (
          alert.latitude !== coordinate.latitude || alert.longitude !== coordinate.longitude
        ));
        neighbours = selectedAlerts.length > 0 ? getNeighboursSelected(selectedAlerts, state.markers) : [];
        return {
          neighbours,
          selectedAlerts
        };
      }
      return { selectedAlerts: [] };
    });
  }

  includeNeighbour = (coordinate) => {
    this.setState((state) => {
      const selectedAlerts = [...state.selectedAlerts, coordinate];
      const neighbours = getNeighboursSelected(selectedAlerts, state.markers);
      return {
        neighbours,
        selectedAlerts
      };
    });
  }

  updateSelectedArea = () => {
    this.setState({
      neighbours: [],
      selectedAlerts: []
    }, () => {
      this.updateMarkers();
      const margin = Platform.OS === 'ios' ? 150 : 250;
      const options = { edgePadding: { top: margin, right: margin, bottom: margin, left: margin }, animated: false };
      if (this.map) this.map.fitToCoordinates(this.props.areaCoordinates, options);
    });
  }

  renderMap = () => {
    if (!this.state.renderMap) {
      this.setState({
        renderMap: true
      });
    }
  }

  renderFooter() {
    const getButtons = () => {
      const { neighbours } = this.state;
      return neighbours && neighbours.length > 0
        ? [
          <ActionBtn
            key="1"
            style={styles.footerButton1}
            text={I18n.t('report.title')}
            onPress={this.reportSelection}
          />,
          <ActionBtn
            key="2"
            style={styles.footerButton2}
            text={I18n.t('report.area')}
            onPress={this.reportArea}
          />
        ]
        : (
          <ActionBtn
            style={styles.footerButton}
            text={I18n.t('report.title')}
            onPress={this.reportSelection}
          />
        );
    };
    return (
      <View pointerEvents="box-none" style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        <View style={styles.btnContainer}>
          {getButtons()}
        </View>
      </View>
    );
  }

  renderFooterLoading() {
    return (!this.state.lastPosition &&
      <View pointerEvents="box-none" style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        <View style={styles.signalNotice}>
          <View style={styles.geoLocationContainer}>
            <Image
              style={styles.marker}
              source={markerCompassRedImage}
            />
            <Animated.View
              style={[styles.geoLocation, { opacity: this.state.geoMarkerOpacity }]}
            />
          </View>
          <Text style={styles.signalNoticeText}>{I18n.t('alerts.satelliteSignal')}</Text>
        </View>
      </View>
    );
  }

  render() {
    const { hasCompass, lastPosition, compassFallback,
            selectedAlerts, neighbours, heading } = this.state;
    const { areaCoordinates, datasetSlug, contextualLayer } = this.props;
    const showCompassFallback = !hasCompass && lastPosition && selectedAlerts && compassFallback;
    const lastAlertIndex = selectedAlerts.length - 1;

    // Map elements
    const basemapLayerElement = (
      <MapView.UrlTile
        urlTemplate={URL_BASEMAP_TEMPLATE}
        zIndex={-1}
      />
    );
    const contextualLayerElement = contextualLayer ? (
      <MapView.UrlTile
        urlTemplate={contextualLayer.url}
        zIndex={1}
      />
    ) : null;
    const compassFallbackElement = showCompassFallback ? (
      <MapView.Polyline
        coordinates={compassFallback}
        strokeColor={Theme.colors.color5}
        strokeWidth={2}
      />
    ) : null;
    const areaPolygonElement = areaCoordinates ? (
      <MapView.Polyline
        coordinates={areaCoordinates}
        strokeColor={Theme.colors.color1}
        strokeWidth={2}
        zIndex={1}
      />
    ) : null;
    const userPositionElement = lastPosition ? (
      <MapView.Marker.Animated
        key="lastPosition"
        image={markerImage}
        coordinate={lastPosition}
        style={{ zIndex: 2 }}
        anchor={{ x: 0.5, y: 0.5 }}
        pointerEvents={'none'}
      />
    ) : null;
    const compassElement = lastPosition && heading ? (
      <MapView.Marker
        key={'compass'}
        coordinate={lastPosition}
        zIndex={1}
        anchor={{ x: 0.5, y: 0.5 }}
        pointerEvents={'none'}
      >
        <Animated.Image
          style={{
            width: 94,
            height: 94,
            transform: [
              { rotate: `${heading || '0'}deg` }
            ]
          }}
          source={compassImage}
        />
      </MapView.Marker>
    ) : null;
    const neighboursAlertsElement = neighbours && neighbours.length > 0
      ? (neighbours.map((neighbour, i) => (
        <MapView.Marker
          key={`neighbour-marker-${i}`}
          coordinate={neighbour}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => this.includeNeighbour(neighbour)}
          zIndex={10}
        >
          <View style={[styles.markerIcon, styles.markerIconArea]} />
        </MapView.Marker>
      )))
      : null;
    const selectedAlertsElement = selectedAlerts && selectedAlerts.length > 0
      ? (selectedAlerts.map((alert, i) => (
        <MapView.Marker
          key={`selected-alert-marker-${i}`}
          coordinate={alert}
          anchor={{ x: 0.5, y: 0.5 }}
          pointerEvents="none"
          onPress={() => this.removeSelection(alert)}
          zIndex={20}
        >
          <View style={styles.markerIcon} />
        </MapView.Marker>
      )))
      : null;
    const clustersElement = datasetSlug ? (
      <Clusters
        key="clusters"
        markers={this.state.markers}
        selectAlert={this.selectAlert}
        zoomTo={this.zoomTo}
        datasetSlug={datasetSlug}
      />
    ) : null;
    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View pointerEvents="none" style={styles.header}>
            <Image
              style={styles.headerBg}
              source={backgroundImage}
            />
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="none"
            minZoomLevel={2}
            maxZoomLevel={18}
            rotateEnabled={false}
            initialRegion={this.state.region}
            onRegionChangeComplete={this.updateRegion}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
            onPress={e => this.mapPress(e.nativeEvent.coordinate)}
          >
            {basemapLayerElement}
            {contextualLayerElement}
            {clustersElement}
            {compassFallbackElement}
            {areaPolygonElement}
            {userPositionElement}
            {compassElement}
            {neighboursAlertsElement}
            {selectedAlertsElement}
          </MapView>
          <AreaCarousel
            navigator={this.props.navigator}
            alertSelected={selectedAlerts[lastAlertIndex]}
            lastPosition={this.state.lastPosition}
          />
          {selectedAlerts && selectedAlerts.length > 0
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
        </View>
      : renderLoading()
    );
  }
}

Map.propTypes = {
  navigator: PropTypes.object.isRequired,
  createReport: PropTypes.func.isRequired,
  cluster: PropTypes.object,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
  }),
  datasetSlug: PropTypes.string,
  areaCoordinates: PropTypes.array,
  actionsPending: PropTypes.number.isRequired,
  syncModalOpen: PropTypes.bool.isRequired,
  syncSkip: PropTypes.bool.isRequired,
  setSyncModal: PropTypes.func.isRequired,
  setCanDisplayAlerts: PropTypes.func.isRequired,
  canDisplayAlerts: PropTypes.bool.isRequired,
  area: PropTypes.object.isRequired,
  contextualLayer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string.isRequired
  })
};

export default Map;
