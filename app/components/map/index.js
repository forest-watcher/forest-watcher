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
  Platform
} from 'react-native';

import { COORDINATES_FORMATS, MAPS, MANUAL_ALERT_SELECTION_ZOOM } from 'config/constants';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import moment from 'moment';
import formatcoords from 'formatcoords';

import MapView from 'react-native-maps';
import ActionBtn from 'components/common/action-button';
import AlertPosition from 'components/map/alert-position';
import MapAttribution from 'components/map/map-attribution';
import AreaCarousel from 'containers/map/area-carousel';
import Clusters from 'containers/map/clusters/';
import { getAllNeighbours } from 'helpers/map';
import tracker from 'helpers/googleAnalytics';
import clusterGenerator from 'helpers/clusters-generator';
import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const Timer = require('react-native-timer');
const geoViewport = require('@mapbox/geo-viewport');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const layersIcon = require('assets/layers.png');

function renderLoading() {
  return (
    <View style={[styles.loaderContainer, styles.loader]}>
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

function getMapZoom(region) {
  if (!region.longitude || !region.latitude) return 0;
  const bounds = [
    region.longitude - (region.longitudeDelta / 2),
    region.latitude - (region.latitudeDelta / 2),
    region.longitude + (region.longitudeDelta / 2),
    region.latitude + (region.latitudeDelta / 2)
  ];

  return geoViewport.viewport(bounds, [width, height], 0, 21, 256).zoom || 0;
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
      { icon: layersIcon, id: 'contextualLayers' }
    ]
  };

  constructor(props) {
    super(props);
    const { center } = props;
    const initialCoords = center || { lat: MAPS.lat, lon: MAPS.lng };
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

    Timer.setTimeout(this, 'setAlerts', this.props.setActiveAlerts, 500);
    this.geoLocate();
  }

  shouldComponentUpdate(nextProps, nextState) {
    const conditions = [
      !isEqual(nextProps.areaCoordinates, this.props.areaCoordinates),
      !isEqual(nextProps.area, this.props.area),
      nextProps.canDisplayAlerts !== this.props.canDisplayAlerts,
      nextProps.datasetSlug !== this.props.datasetSlug,
      !isEqual(nextProps.center, this.props.center),
      !isEqual(nextProps.contextualLayer, this.props.contextualLayer),
      nextState.renderMap !== this.state.renderMap,
      !isEqual(nextState.lastPosition, this.state.lastPosition),
      nextState.hasCompass !== this.state.hasCompass,
      nextState.heading !== this.state.heading,
      !isEqual(nextState.region, this.state.region),
      !isEqual(nextState.markers, this.state.markers),
      !isEqual(nextState.selectedAlerts, this.state.selectedAlerts),
      !isEqual(nextState.neighbours, this.state.neighbours),
      !isEqual(nextState.compassFallback, this.state.compassFallback)
    ];
    return conditions.includes(true);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.selectedAlerts !== nextState.selectedAlerts && this.state.lastPosition !== null) {
      this.setCompassLine();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { datasetSlug, area, setActiveAlerts, areaCoordinates } = this.props;
    const { clusters } = clusterGenerator;
    if (this.map && area && (clusters === null || area.id !== prevProps.area.id
      || area.dataset.slug !== prevProps.area.dataset.slug
      || area.dataset.startDate !== prevProps.area.dataset.startDate)) {
      setActiveAlerts();
    }
    if (clusters !== null || !datasetSlug) {
      this.renderMap();
    }
    if (this.state.renderMap) {
      if (!isEqual(areaCoordinates, prevProps.areaCoordinates)) {
        this.updateSelectedArea();
      } else if (!isEqual(clusters, prevProps.clusters)) {
        this.updateMarkers();
      }
    }
    if (this.state.selectedAlerts !== prevState.selectedAlerts) {
      this.setHeaderTitle();
    }
  }

  componentWillUnmount() {
    Location.stopUpdatingLocation();
    Timer.clearTimeout(this, 'setAlerts');
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
    const { setCanDisplayAlerts, canDisplayAlerts } = this.props;
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
    const { navigator, coordinatesFormat } = this.props;
    const last = selectedAlerts.length - 1;
    let headerText = I18n.t('dashboard.map');
    if (selectedAlerts && selectedAlerts.length > 0) {
      const lat = selectedAlerts[last].latitude;
      const lng = selectedAlerts[last].longitude;
      if (coordinatesFormat === COORDINATES_FORMATS.decimal.value) {
        headerText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      } else {
        headerText = formatcoords(lat, lng)
          .format('FFf', { latLonSeparator: ', ', decimalPlaces: 2 });
      }
      navigator.setStyle({
        navBarTextFontSize: 16
      });
    } else {
      navigator.setStyle({
        navBarTextFontSize: 18
      });
    }
    navigator.setTitle({
      title: headerText
    });
  }

  updateMarkers = debounce((clean = false) => {
    const { region } = this.state;
    const bbox = [
      region.longitude - (region.longitudeDelta / 2),
      region.latitude - (region.latitudeDelta / 2),
      region.longitude + (region.longitudeDelta / 2),
      region.latitude + (region.latitudeDelta / 2)
    ];
    const zoom = getMapZoom(region);
    const clusters = clusterGenerator.clusters && clusterGenerator.clusters.getClusters(bbox, zoom);
    const markers = clusters || [];
    markers.activeMarkersId = markers.length > 0 ? bbox.join('_') + zoom : '';

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
    const userLatLng = this.state.lastPosition && `${this.state.lastPosition.latitude},${this.state.lastPosition.longitude}`;
    const screen = 'ForestWatcher.NewReport';
    const title = 'Report';
    const form = `${area.name.toUpperCase()}-${area.dataset.name}-REPORT--${moment().format('YYYY-MM-DDTHH:mm:ss')}`;
    this.props.createReport({
      area,
      name: form,
      userPosition: userLatLng || '0,0',
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
      throttle((location) => {
        const coords = typeof location.coords !== 'undefined' ? location.coords : location;
        this.setState({
          lastPosition: {
            latitude: coords.latitude,
            longitude: coords.longitude
          }
        });
      }, 300),
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
        throttle((data) => {
          this.setState(updateHeading(data.heading));
        }, 450)
      );
    } else {
      SensorManager.startOrientation(300);
      this.eventOrientation = DeviceEventEmitter.addListener(
        'Orientation',
        throttle((data) => {
          this.setState(updateHeading(data.azimuth));
        }, 450)
      );
    }
  }

  updateRegion = (region) => {
    const clean = getMapZoom(this.state.region) > getMapZoom(region);
    this.setState({ region }, () => {
      this.updateMarkers(clean);
    });
  }

  zoomScale = () => {
    const zoomLevel = getMapZoom(this.state.region);
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
    if (coordinate) {
      const alertsToAdd = getMapZoom(this.state.region) >= MANUAL_ALERT_SELECTION_ZOOM
        ? [coordinate]
        : [];
      this.setState(({ selectedAlerts }) => ({
        neighbours: [],
        selectedAlerts: selectedAlerts && selectedAlerts.length > 0 ? [] : alertsToAdd
      }));
    }
  }

  selectAlert = (coordinate) => {
    if (coordinate) {
      const { markers } = this.state;
      const selectedAlerts = [...this.state.selectedAlerts, coordinate];
      const neighbours = getNeighboursSelected(selectedAlerts, markers);
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
      if (this.map && this.props.areaCoordinates) {
        this.map.fitToCoordinates(this.props.areaCoordinates, options);
      }
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
            left
            icon="reportSingle"
            style={[styles.footerButton, styles.footerButton1]}
            text={I18n.t('report.selected').toUpperCase()}
            onPress={this.reportSelection}
          />,
          <ActionBtn
            key="2"
            left
            monochrome
            icon="reportArea"
            style={[styles.footerButton, styles.footerButton2, styles.footerReport]}
            text={I18n.t('report.area').toUpperCase()}
            onPress={this.reportArea}
          />
        ]
        : (
          <ActionBtn
            style={styles.footerButton}
            text={I18n.t('report.title').toUpperCase()}
            onPress={this.reportSelection}
          />
        );
    };
    return (
      <View pointerEvents="box-none" style={styles.btnContainer}>
        {getButtons()}
      </View>
    );
  }

  renderFooterLoading() {
    return (!this.state.lastPosition &&
      <View pointerEvents="box-none" style={styles.signalNotice}>
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
    );
  }

  render() {
    const { hasCompass, lastPosition, compassFallback,
            selectedAlerts, neighbours, heading, markers } = this.state;
    const { areaCoordinates, datasetSlug, contextualLayer,
            basemapLocalTilePath, isConnected, ctxLayerLocalTilePath, coordinatesFormat } = this.props;
    const showCompassFallback = !hasCompass && lastPosition && selectedAlerts && compassFallback;
    const lastAlertIndex = selectedAlerts.length - 1;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;
    const hasNeighbours = neighbours && neighbours.length > 0;
    let veilHeight = 120;
    if (hasAlertsSelected) veilHeight = hasNeighbours ? 260 : 180;
    const isIOS = Platform.OS === 'ios';
    const ctxLayerKey = isIOS && contextualLayer ? `contextualLayerElement-${contextualLayer.name}` : 'contextualLayerElement';
    const clustersKey = markers
      ? `clustersElement-${clusterGenerator.activeClusterId}_${markers.activeMarkersId}`
      : 'clustersElement';

    // Map elements
    const basemapLayerElement = isConnected ?
      (
        <MapView.UrlTile
          key="basemapLayerElement"
          urlTemplate={MAPS.basemap}
          zIndex={-1}
        />
      )
      : (
        <MapView.LocalTile
          key="localBasemapLayerElementL"
          localTemplate={basemapLocalTilePath}
          zIndex={-1}
          maxZoom={12}
        />
      );
    const contextualLayerElement = contextualLayer // eslint-disable-line
      ? isConnected
        ? (
          <MapView.UrlTile
            key={ctxLayerKey}
            urlTemplate={contextualLayer.url}
            zIndex={1}
          />
        )
        : (
          <MapView.LocalTile
            key={ctxLayerKey}
            localTemplate={ctxLayerLocalTilePath}
            zIndex={1}
            maxZoom={12}
          />
        )
      : null;
    const compassFallbackElement = showCompassFallback ? (
      <MapView.Polyline
        key="compassFallbackElement"
        coordinates={compassFallback}
        strokeColor={Theme.colors.color5}
        strokeWidth={2}
        zIndex={2}
      />
    ) : null;
    const areaPolygonElement = areaCoordinates ? (
      <MapView.Polyline
        key="areaPolygonElement"
        coordinates={areaCoordinates}
        strokeColor={Theme.colors.color1}
        strokeWidth={2}
        zIndex={2}
      />
    ) : null;
    const userPositionElement = lastPosition ? (
      <MapView.Marker.Animated
        key="userPositionElement"
        image={markerImage}
        coordinate={lastPosition}
        style={{ zIndex: 3 }}
        anchor={{ x: 0.5, y: 0.5 }}
        pointerEvents={'none'}
      />
    ) : null;
    const compassElement = lastPosition && heading ? (
      <MapView.Marker
        key="compassElement"
        coordinate={lastPosition}
        zIndex={2}
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
          key={`neighboursAlertsElement-${i}-${Object.values(neighbour).join('_')}`}
          coordinate={neighbour}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => this.includeNeighbour(neighbour)}
          zIndex={10}
        >
          <View style={[styles.markerIcon, styles.markerIconArea]} />
        </MapView.Marker>
      )))
      : null;
    const selectedAlertsElement = hasAlertsSelected
      ? (selectedAlerts.map((alert, i) => (
        <MapView.Marker
          key={`selectedAlertsElement-${i}-${Object.values(alert).join('_')}`}
          coordinate={alert}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => this.removeSelection(alert)}
          zIndex={20}
        >
          <View style={styles.markerIcon} />
        </MapView.Marker>
      )))
      : null;
    const clustersElement = datasetSlug ? (
      <Clusters
        key={clustersKey}
        markers={markers}
        selectAlert={this.selectAlert}
        zoomTo={this.zoomTo}
        datasetSlug={datasetSlug}
      />
    ) : null;
    return (
      <View style={styles.container}>
        {!this.state.renderMap && renderLoading()}
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
          mapType={'none'}
          minZoomLevel={2}
          maxZoomLevel={18}
          rotateEnabled={false}
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
        <View pointerEvents="none" style={[styles.footerBGContainer, { height: veilHeight }]}>
          <Image
            style={[styles.footerBg, { height: veilHeight }]}
            source={backgroundImage}
          />
        </View>
        <View pointerEvents="box-none" style={styles.footer}>
          <View pointerEvents="none" style={styles.footerRow}>
            {hasAlertsSelected &&
              <AlertPosition
                alertSelected={selectedAlerts[lastAlertIndex]}
                lastPosition={this.state.lastPosition}
                coordinatesFormat={coordinatesFormat}
              />
            }
            <MapAttribution />
          </View>
          {hasAlertsSelected
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
          {!hasAlertsSelected &&
            <AreaCarousel
              navigator={this.props.navigator}
              alertSelected={selectedAlerts[lastAlertIndex]}
              lastPosition={this.state.lastPosition}
            />
          }
        </View>
      </View>
    );
  }
}

Map.propTypes = {
  navigator: PropTypes.object.isRequired,
  createReport: PropTypes.func.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
  }),
  datasetSlug: PropTypes.string,
  basemapLocalTilePath: PropTypes.string,
  ctxLayerLocalTilePath: PropTypes.string,
  areaCoordinates: PropTypes.array,
  isConnected: PropTypes.bool.isRequired,
  setCanDisplayAlerts: PropTypes.func.isRequired,
  canDisplayAlerts: PropTypes.bool.isRequired,
  area: PropTypes.object.isRequired,
  setActiveAlerts: PropTypes.func.isRequired,
  contextualLayer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string.isRequired
  }),
  coordinatesFormat: PropTypes.string.isRequired
};

export default Map;
