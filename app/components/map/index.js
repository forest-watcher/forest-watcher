import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Dimensions,
  DeviceEventEmitter,
  Animated,
  Easing,
  StatusBar,
  Image,
  Text,
  Platform
} from 'react-native';

import { MAPS, MANUAL_ALERT_SELECTION_ZOOM } from 'config/constants';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import moment from 'moment';

import MapView from 'react-native-maps';
import ActionBtn from 'components/common/action-button';
import CircleButton from 'components/common/circle-button';
import AlertPosition from 'components/map/alert-position';
import MapAttribution from 'components/map/map-attribution';
import Clusters from 'containers/map/clusters';
import { formatCoordsByFormat, getAllNeighbours } from 'helpers/map';
import tracker from 'helpers/googleAnalytics';
import clusterGenerator from 'helpers/clusters-generator';
import Theme from 'config/theme';
import i18n from 'locales';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const geoViewport = require('@mapbox/geo-viewport');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 5;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const settingsBlackIcon = require('assets/settings_black.png');
const myLocationIcon = require('assets/my_location.png');
const reportAreaIcon = require('assets/report_area.png');

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

class MapComponent extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color5,
    navBarButtonColor: Theme.colors.color5,
    drawUnderNavBar: true,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarTransparent: true,
    navBarTranslucent: true
  };

  margin = Platform.OS === 'ios' ? 50 : 100;
  FIT_OPTIONS = { edgePadding: { top: this.margin, right: this.margin, bottom: this.margin, left: this.margin }, animated: false };

  static getMapZoom(region) {
    if (!region.longitude || !region.latitude) return 0;
    const bounds = [
      region.longitude - (region.longitudeDelta / 2.5),
      region.latitude - (region.latitudeDelta / 2.5),
      region.longitude + (region.longitudeDelta / 2.5),
      region.latitude + (region.latitudeDelta / 2.5)
    ];

    return geoViewport.viewport(bounds, [width, height], 0, 18, 256).zoom || 0;
  }

  constructor(props) {
    super(props);
    const { center } = props;
    const initialCoords = center || { lat: MAPS.lat, lon: MAPS.lng };
    this.eventLocation = null;
    this.eventOrientation = null;
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
      mapZoom: 2
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
  }

  shouldComponentUpdate(nextProps, nextState) {
    const conditions = [
      !isEqual(nextProps.areaCoordinates, this.props.areaCoordinates),
      !isEqual(nextProps.area, this.props.area),
      nextProps.canDisplayAlerts !== this.props.canDisplayAlerts,
      !isEqual(nextProps.contextualLayer, this.props.contextualLayer),
      !isEqual(nextState.lastPosition, this.state.lastPosition),
      nextState.hasCompass !== this.state.hasCompass,
      nextState.heading !== this.state.heading,
      !isEqual(nextState.markers, this.state.markers),
      !isEqual(nextState.selectedAlerts, this.state.selectedAlerts),
      !isEqual(nextState.neighbours, this.state.neighbours),
      !isEqual(nextState.compassLine, this.state.compassLine)
    ];
    return conditions.includes(true);
  }

  componentDidUpdate(prevProps, prevState) {
    const { area, setActiveAlerts } = this.props;
    if (area && area.id && area.dataset) {
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

    if (this.state.selectedAlerts !== prevState.selectedAlerts) {
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
    Location.stopUpdatingLocation();
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
      default:
    }
  }

  onSettingsPress = () => {
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

  onMapReady = () => {
    if (this.props.areaCoordinates) {
      requestAnimationFrame(() => this.map.fitToCoordinates(this.props.areaCoordinates, this.FIT_OPTIONS));
    }
    this.props.setActiveAlerts();
    this.updateMarkers();
  }

  setCompassLine = () => {
    this.setState((prevState) => {
      const state = {};
      if (prevState.selectedAlerts && prevState.selectedAlerts.length > 0 && this.state.lastPosition) {
        const last = this.state.selectedAlerts.length - 1;
        // extract not needed props
        // eslint-disable-next-line no-unused-vars
        const { accuracy, altitude, speed, course, ...rest } = this.state.lastPosition;
        state.compassLine = [{ ...rest }, { ...this.state.selectedAlerts[last] }];
      }
      if (prevState.compassLine !== null && prevState.selectedAlerts.length === 0) {
        state.compassLine = null;
      }
      return state;
    });
  }

  setHeaderTitle = () => {
    const { selectedAlerts } = this.state;
    const { navigator, coordinatesFormat } = this.props;
    let headerText = i18n.t('dashboard.map');
    if (selectedAlerts && selectedAlerts.length > 0) {
      const last = selectedAlerts.length - 1;
      const coordinates = {
        latitude: selectedAlerts[last].latitude,
        longitude: selectedAlerts[last].longitude
      };
      headerText = formatCoordsByFormat(coordinates, coordinatesFormat);
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
      region.longitude - (region.longitudeDelta / 2),
      region.latitude - (region.latitudeDelta / 2),
      region.longitude + (region.longitudeDelta / 2),
      region.latitude + (region.latitudeDelta / 2)
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
      const options = { edgePadding: { top: 100, right: 40, bottom: 240, left: 40 }, animated: true };
      const coordinates = [lastPosition];
      if (selectedAlerts.length) {
        coordinates.push(selectedAlerts[selectedAlerts.length - 1]);
      }
      this.map.fitToCoordinates(coordinates, options);
    }
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
    const userLatLng = this.state.lastPosition && `${this.state.lastPosition.latitude},${this.state.lastPosition.longitude}`;
    const screen = 'ForestWatcher.NewReport';
    const title = i18n.t('report.title');
    const reportedDataset = area.dataset ? `-${area.dataset.name}` : '';
    const form = `${area.name.toUpperCase()}${reportedDataset}-REPORT--${moment().format('YYYY-MM-DDTHH:mm:ss')}`;
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
        if (lastPosition && (lastPosition.latitude !== coords.latitude ||
          lastPosition.longitude !== coords.longitude)) {
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
    const mapZoom = MapComponent.getMapZoom(region);

    this.setState({ region, mapZoom }, () => {
      this.updateMarkers();
    });
  }

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
  }

  mapPress = (coordinate) => {
    if (coordinate) {
      const alertsToAdd = this.state.mapZoom >= MANUAL_ALERT_SELECTION_ZOOM
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
      if (this.map && this.props.areaCoordinates) {
        this.map.fitToCoordinates(this.props.areaCoordinates, this.FIT_OPTIONS);
      }
    });
  }

  renderButtonPanelSelected() {
    const { selectedAlerts, lastPosition, neighbours } = this.state;
    const { coordinatesFormat } = this.props;
    const lastAlertIndex = selectedAlerts.length - 1;
    return (
      <View style={[styles.buttonPanel, styles.buttonPanelSelected]}>
        <View style={styles.buttonPanelRow}>
          {lastPosition
            ? <CircleButton
              light
              style={styles.btnLeft}
              icon={myLocationIcon}
              onPress={this.fitPosition}
            />
            : this.renderNoSignal()
          }
          <AlertPosition
            alertSelected={selectedAlerts[lastAlertIndex]}
            lastPosition={this.state.lastPosition}
            coordinatesFormat={coordinatesFormat}
            kmThreshold={30}
          />
        </View>
        <View style={styles.buttonPanelRow}>
          <View pointerEvents="box-none" style={styles.btnContainer}>
            {neighbours && neighbours.length > 0
              ? <React.Fragment>
                <CircleButton
                  icon={reportAreaIcon}
                  style={styles.btnLeft}
                  onPress={this.reportSelection}
                />,
                <ActionBtn
                  short
                  left
                  style={styles.btnReport}
                  text={i18n.t('report.selected').toUpperCase()}
                  onPress={this.reportArea}
                />
              </React.Fragment>
              : (
                <ActionBtn
                  short
                  left
                  style={styles.btnReport}
                  text={i18n.t('report.title').toUpperCase()}
                  onPress={this.reportSelection}
                />
              )
            }
          </View>
        </View>
      </View>
    );
  }

  renderButtonPanel() {
    const { lastPosition } = this.state;
    return (
      <View style={styles.buttonPanel}>
        {lastPosition
          ? <CircleButton onPress={this.fitPosition} light icon={myLocationIcon} />
          : this.renderNoSignal()
        }
        <CircleButton onPress={this.onSettingsPress} light icon={settingsBlackIcon} />
      </View>
    );
  }

  renderNoSignal() {
    return (
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
        <Text style={styles.signalNoticeText}>{i18n.t('alerts.satelliteSignal')}</Text>
      </View>
    );
  }

  renderMapFooter() {
    const { selectedAlerts, neighbours } = this.state;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;

    const hasNeighbours = neighbours && neighbours.length > 0;
    let veilHeight = 120;
    if (hasAlertsSelected) veilHeight = hasNeighbours ? 260 : 180;

    return (
      <React.Fragment>
        <View pointerEvents="none" style={[styles.footerBGContainer, { height: veilHeight }]}>
          <Image
            style={[styles.footerBg, { height: veilHeight }]}
            source={backgroundImage}
          />
        </View>
        <View pointerEvents="box-none" style={styles.footer}>
          {hasAlertsSelected
            ? this.renderButtonPanelSelected()
            : this.renderButtonPanel()
          }
          <MapAttribution />
        </View>
      </React.Fragment>
    );
  }

  render() {
    const { lastPosition, compassLine, region,
            selectedAlerts, neighbours, heading, markers } = this.state;
    const { areaCoordinates, area, contextualLayer,
            basemapLocalTilePath, isConnected, ctxLayerLocalTilePath } = this.props;
    const showCompassLine = lastPosition && selectedAlerts && compassLine;
    const hasAlertsSelected = selectedAlerts && selectedAlerts.length > 0;
    const isIOS = Platform.OS === 'ios';
    const ctxLayerKey = isIOS && contextualLayer ? `contextualLayerElement-${contextualLayer.name}` : 'contextualLayerElement';
    const keyRand = isIOS ? Math.floor((Math.random() * 100) + 1) : '';
    const clustersKey = markers
      ? `clustersElement-${clusterGenerator.activeClusterId}_${markers.activeMarkersId}`
      : 'clustersElement';
    const markerSize = this.getMarkerSize();

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
          pathTemplate={basemapLocalTilePath}
          zIndex={-1}
          maxZoom={12}
          tileSize={256}
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
            pathTemplate={ctxLayerLocalTilePath}
            zIndex={1}
            maxZoom={12}
            tileSize={256}
          />
        )
      : null;
    const compassLineElement = showCompassLine ? (
      <MapView.Polyline
        key="compassLineElement"
        coordinates={compassLine}
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
          key={`neighboursAlertsElement-${i}-${keyRand}`}
          coordinate={neighbour}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => this.includeNeighbour(neighbour)}
          zIndex={10}
        >
          <View style={[markerSize, styles.markerIconArea]} />
        </MapView.Marker>
      )))
      : null;
    const selectedAlertsElement = hasAlertsSelected
      ? (selectedAlerts.map((alert, i) => (
        <MapView.Marker
          key={`selectedAlertsElement-${i}-${keyRand}`}
          coordinate={alert}
          anchor={{ x: 0.5, y: 0.5 }}
          onPress={() => this.removeSelection(alert)}
          zIndex={20}
        >
          <View style={[markerSize, styles.selectedMarkerIcon]} />
        </MapView.Marker>
      )))
      : null;
    const clustersElement = area && area.dataset ? (
      <Clusters
        key={clustersKey}
        markers={markers}
        selectAlert={this.selectAlert}
        zoomTo={this.zoomTo}
        datasetSlug={area.dataset.slug}
        markerSize={markerSize}
      />
    ) : null;

    return (
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
          initialRegion={region}
          showsCompass
          rotateEnabled
          moveOnMarkerPress={false}
          onMapReady={this.onMapReady}
          onRegionChangeComplete={this.updateRegion}
          onPress={e => this.mapPress(e.nativeEvent.coordinate)}
        >
          {basemapLayerElement}
          {contextualLayerElement}
          {clustersElement}
          {compassLineElement}
          {areaPolygonElement}
          {userPositionElement}
          {compassElement}
          {neighboursAlertsElement}
          {selectedAlertsElement}
        </MapView>
        {this.renderMapFooter()}
      </View>
    );
  }
}

MapComponent.propTypes = {
  navigator: PropTypes.object.isRequired,
  createReport: PropTypes.func.isRequired,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired
  }),
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

export default MapComponent;
