import React, { Component } from 'react';
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
import CONSTANTS from 'config/constants';
import throttle from 'lodash/throttle';
import debounce from 'lodash/debounce';

import Theme from 'config/theme';
import { daysToDate } from 'helpers/date';
import { getUrlTile } from 'helpers/map';
import { initDb, read } from 'helpers/database';
import ActionBtn from 'components/common/action-button';
import AreaCarousel from 'containers/map/area-carousel/';
import tracker from 'helpers/googleAnalytics';
import I18n from 'locales';
import MapView from 'react-native-maps';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const sphereKnn = require('sphere-knn'); // eslint-disable-line
const supercluster = require('supercluster'); // eslint-disable-line
const geoViewport = require('@mapbox/geo-viewport');
const tilebelt = require('@mapbox/tilebelt');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');

function convertPoints(data) {
  return {
    type: 'MapCollection',
    features: data.map((value) => ({
      type: 'Map',
      properties: {
        lat: value.lat,
        long: value.long
      },
      geometry: {
        type: 'Point',
        coordinates: [
          value.long,
          value.lat
        ]
      }
    }))
  };
}

function createCluster(data) {
  const cluster = supercluster({
    radius: 120,
    maxZoom: 16, // Default: 16,
    extent: 256,
    nodeSize: 64
  });
  cluster.load(data.features);
  return cluster;
}

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

class Map extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color5,
    navBarButtonColor: Theme.colors.color5,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main,
    navBarTransparent: true,
    navBarTranslucent: true
  };

  constructor(props) {
    super(props);
    const { center } = props;
    const initialCoords = center || { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };
    this.eventLocation = null;
    this.eventOrientation = null;
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
      coordinates: {
        tile: [], // tile coordinates x, y, z + precision x, y
        precision: [] // tile precision x, y
      },
      alertSelected: null,
      urlTile: null,
      markers: []
    };
    this.geoPoints = props.alerts.length > 0 ? convertPoints(props.alerts) : null;
    this.cluster = this.geopoints && createCluster(this.geoPoints);
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    if (Platform.OS === 'ios') {
      Location.requestWhenInUseAuthorization();
      StatusBar.setBarStyle('light-content');
    }

    const { datasetSlug } = this.props;
    this.setUrlTile(datasetSlug);
    this.renderMap();
    this.geoLocate();
    this.updateMarkers();
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.alertSelected !== nextState.alertSelected && this.state.lastPosition !== null) {
      this.setCompassLine();
    }

    if (this.props.datasetSlug !== nextProps.datasetSlug ||
        this.props.startDate !== nextProps.startDate ||
        this.props.endDate !== nextProps.endDate ||
        this.props.areaCoordinates !== nextProps.areaCoordinates) {
      this.updateSelectedArea();
    }
    this.updateMarkers();
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

  onLayout = () => {
    if (!this.state.alertSelected) {
      // TODO: fix fitToCoordinates
      // const fitOptions = { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: true };
      // if (this.props.areaCoordinates) {
      //   this.map.fitToCoordinates(this.props.areaCoordinates, fitOptions);
      // }
    }
  }

  onMapPress = (e) => {
    this.selectAlert(e.nativeEvent.coordinate);
  }

  async setUrlTile(datasetSlug) {
    const url = await getUrlTile(datasetSlug);
    this.setState({ urlTile: url });
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
      if (prevState.alertSelected !== null) {
        // extract not needed props
        // eslint-disable-next-line no-unused-vars
        const { accuracy, altitude, speed, course, ...rest } = this.state.lastPosition;
        state.compassFallback = [{ ...rest }, { ...this.state.alertSelected }];
      }
      if (prevState.compassFallback !== null && prevState.alertSelected === null) {
        state.compassFallback = null;
      }
      return state;
    });
  }

  getMarkersClusters() {
    const padding = 0;
    const markers = this.cluster && this.cluster.getClusters([
      this.state.region.longitude - (this.state.region.longitudeDelta * (0.5 + padding)),
      this.state.region.latitude - (this.state.region.latitudeDelta * (0.5 + padding)),
      this.state.region.longitude + (this.state.region.longitudeDelta * (0.5 + padding)),
      this.state.region.latitude + (this.state.region.latitudeDelta * (0.5 + padding))
    ], this.getMapZoom());
    return markers || [];
  }

  updateMarkers() {
    this.markers = this.getMarkersClusters();
  }

  createReport = () => {
    const { alertSelected } = this.state;
    let latLng = '0,0';
    if (alertSelected) {
      latLng = `${alertSelected.latitude},${alertSelected.longitude}`;
    }
    const screen = 'ForestWatcher.NewReport';
    const title = 'Report';
    const form = `New-report-${Math.floor(Math.random() * 1000)}`;
    this.props.createReport(form, latLng);
    this.props.navigator.push({
      screen,
      title,
      passProps: {
        screen,
        title,
        form,
        questionsToSkip: 4,
        texts: {
          saveLaterTitle: 'report.saveLaterTitle',
          saveLaterDescription: 'report.saveLaterDescription',
          requiredId: 'report.reportIdRequired'
        }
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
        this.setState({
          lastPosition: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
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
        const coords = Platform.OS === 'ios' ? location.coords : location;
        this.setState({
          lastPosition: coords
        });
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
    this.setState({ region });
    if (this.state.alertSelected) {
      this.updateSelectedAlertZoom();
    }
  }

  updateSelectedAlertZoom = () => {
    const zoom = this.getMapZoom();
    const { latitude, longitude } = this.state.alertSelected;
    if (zoom) {
      const tile = tilebelt.pointToTile(longitude, latitude, zoom, true);
      this.setState({
        coordinates: {
          tile: [tile[0], tile[1], tile[2]],
          precision: [tile[3], tile[4]]
        }
      });
    }
  }

  selectAlert = (coordinates) => {
    const threshold = 0.003;
    console.warn('coordinates', coordinates);
    const realm = initDb();
    let selectedAlertCoordinates = null;
    const alerts = read(realm, 'Alert');
    const filter = `areaId = '${this.props.areaId}' AND long < ${coordinates.longitude + threshold} AND long > ${coordinates.longitude - threshold} AND lat < ${coordinates.latitude + threshold} AND lat > ${coordinates.latitude - threshold} AND slug = '${this.props.datasetSlug}'`;
    const filteredAlerts = alerts.filtered(filter);
    console.warn('filtered count', Array.from(filteredAlerts).length);

    if (Array.from(filteredAlerts).length > 0) {
      const parsedAlerts = filteredAlerts.map((alert) => ({ latitude: alert.lat, longitude: alert.long }));
      console.warn('parsedAlerts', parsedAlerts);
      const lookup = sphereKnn(parsedAlerts);
      const closestAlerts = lookup(coordinates.latitude, coordinates.longitude, 1);
      if (parsedAlerts.length > 0) {
        const selectedAlert = closestAlerts[0];
        selectedAlertCoordinates = { longitude: selectedAlert.longitude, latitude: selectedAlert.latitude };
        console.warn('selectedAlertCoordinates', selectedAlertCoordinates);
      }
    }

    const zoom = this.getMapZoom();
    if (zoom) {
      console.warn('zoom', zoom);
      const tile = tilebelt.pointToTile(coordinates.longitude, coordinates.latitude, zoom, true);
      this.setState({
        alertSelected: coordinates,
        coordinates: {
          tile: [tile[0], tile[1], tile[2]],
          precision: [tile[3], tile[4]]
        },
        selectedAlertCoordinates
      });
    }
  }

  updateSelectedArea = () => {
    this.setState({
      coordinates: {
        tile: [], // tile coordinates x, y, z + precision x, y
        precision: [] // tile precision x, y
      },
      alertSelected: null,
      urlTile: null
    }, () => {
      // TODO: FIX fitToCoordinates
      // const options = { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: false };
      // this.map.fitToCoordinates(this.props.areaCoordinates, options);
      if (this.props.datasetSlug) {
        this.setUrlTile(this.props.datasetSlug);
      }
    });
  }

  renderMap() {
    if (!this.state.renderMap) {
      this.setState({
        renderMap: true
      });
    }
  }

  renderFooter() {
    const reportBtn = (
      <ActionBtn
        style={styles.footerButton}
        text={I18n.t('report.title')}
        onPress={this.createReport}
      />
    );
    return (
      <View style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        {reportBtn}
      </View>
    );
  }

  renderFooterLoading() {
    return (!this.state.lastPosition &&
      <View style={styles.footer}>
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
    const { alertSelected, urlTile, hasCompass, lastPosition, compassFallback, selectedAlertCoordinates } = this.state;
    const { datasetSlug, startDate, endDate, areaCoordinates } = this.props;
    const showCompassFallback = !hasCompass && lastPosition && alertSelected && compassFallback;

    const dates = {
      min: datasetSlug === 'viirs' ? String(startDate) : daysToDate(startDate),
      max: datasetSlug === 'viirs' ? String(endDate) : daysToDate(endDate)
    };
    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View
            style={styles.header}
            pointerEvents={'box-none'}
          >
            {selectedAlertCoordinates &&
              <Text style={styles.headerSubtitle}>
                {selectedAlertCoordinates.latitude}, {selectedAlertCoordinates.longitude}
              </Text>
            }
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            onPress={this.onMapPress}
            initialRegion={this.state.region}
            onRegionChange={debounce(region => this.updateRegion(region), 100)}
            onRegionChangeComplete={this.updateRegion}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
          >
            {this.markers.map((marker, index) => (
              <MapView.Marker
                key={index}
                coordinate={{
                  latitude: marker.geometry.coordinates[1],
                  longitude: marker.geometry.coordinates[0]
                }}
                zIndex={1}
                anchor={{ x: 0.5, y: 0.5 }}
                pointerEvents={'none'}
              />
            ))}
            {showCompassFallback &&
              <MapView.Polyline
                coordinates={this.state.compassFallback}
                strokeColor={Theme.colors.color5}
                strokeWidth={2}
              />
            }
            {areaCoordinates &&
              <MapView.Polyline
                coordinates={areaCoordinates}
                strokeColor={Theme.colors.color1}
                strokeWidth={2}
              />
            }
            {this.state.lastPosition &&
              <MapView.Marker.Animated
                image={markerImage}
                coordinate={this.state.lastPosition}
                style={{ zIndex: 2 }}
                anchor={{ x: 0.5, y: 0.5 }}
                pointerEvents={'none'}
              />
            }
            {this.state.lastPosition && this.state.heading
              ?
                <MapView.Marker
                  key={'compass'}
                  coordinate={this.state.lastPosition}
                  zIndex={1}
                  anchor={{ x: 0.5, y: 0.5 }}
                  pointerEvents={'none'}
                >
                  <Animated.Image
                    style={{
                      width: 94,
                      height: 94,
                      transform: [
                        { rotate: `${this.state.heading ? this.state.heading : '0'}deg` }
                      ]
                    }}
                    source={compassImage}
                  />
                </MapView.Marker>
              : null
            }

            {this.alerts &&
              this.alerts.map((alertCoord, index) =>
                <MapView.Marker
                  key={index}
                  coordinate={alertCoord}
                  zIndex={1}
                  pinColor={'blue'}
                />
              )
            }

            {selectedAlertCoordinates &&
              <MapView.Marker
                key={'selectedAlert'}
                coordinate={selectedAlertCoordinates}
                zIndex={1}
              />
            }
            {urlTile &&
              <MapView.CanvasUrlTile
                urlTemplate={urlTile}
                zIndex={-1}
                maxZoom={12}
                areaId={this.props.areaId}
                alertType={datasetSlug}
                isConnected={this.props.isConnected}
                minDate={dates.min}
                maxDate={dates.max}
              />
            }
          </MapView>
          {selectedAlertCoordinates
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
          <AreaCarousel
            navigator={this.props.navigator}
            alertSelected={this.state.selectedAlertCoordinates}
            lastPosition={this.state.lastPosition}
          />
        </View>
      : renderLoading()
    );
  }
}

Map.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  createReport: React.PropTypes.func.isRequired,
  isConnected: React.PropTypes.bool,
  areaId: React.PropTypes.string.isRequired,
  alerts: React.PropTypes.array.isRequired,
  center: React.PropTypes.shape({
    lat: React.PropTypes.number.isRequired,
    lon: React.PropTypes.number.isRequired
  }),
  startDate: React.PropTypes.string.isRequired,
  endDate: React.PropTypes.string.isRequired,
  datasetSlug: React.PropTypes.string.isRequired,
  areaCoordinates: React.PropTypes.array
};

export default Map;
