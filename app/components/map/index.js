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

import Theme from 'config/theme';
import daysSince from 'helpers/date';
import ActionBtn from 'components/common/action-button';
import AreaCarousel from 'components/map/area-carousel/';
import tracker from 'helpers/googleAnalytics';
import enabledDatasetSlug from 'helpers/area';
import I18n from 'locales';
import MapView from 'react-native-maps';
import styles from './styles';

import { SensorManager } from 'NativeModules'; // eslint-disable-line

const geoViewport = require('@mapbox/geo-viewport');
const tilebelt = require('@mapbox/tilebelt');

const { RNLocation: Location } = require('NativeModules'); // eslint-disable-line
const BoundingBox = require('boundingbox');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const markerCompassRedImage = require('assets/compass_circle_red.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');


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

    const { geostores, areas } = props;
    const areaGeostoreIds = areas.map((area) => (area.geostoreId));
    const filteredGeostores = areaGeostoreIds.map((areaId) => (geostores[areaId]));
    this.areaFeatures = filteredGeostores.map((geostore) => geostore.features[0]);
    const center = new BoundingBox(this.areaFeatures[0]).getCenter();
    const initialCoords = center || { lat: CONSTANTS.maps.lat, lon: CONSTANTS.maps.lng };
    this.afterRenderTimer = null;
    this.eventLocation = null;
    this.eventOrientation = null;
    // Google maps lon and lat are inverted
    this.state = {
      index: 0,
      renderMap: false,
      lastPosition: null,
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
      areaCoordinates: this.getAreaCoordinates(this.areaFeatures[0]),
      areaId: areas[0].id,
      alertSelected: null,
      datasetSlug: null
      // alerts: params.features && params.features.length > 0 ? params.features.slice(0, 120) : [] // Provisional
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Map');

    if (Platform.OS === 'ios') {
      Location.requestWhenInUseAuthorization();
      StatusBar.setBarStyle('light-content');
    }

    this.renderMap();
    this.geoLocate();
  }

  componentWillUnmount() {
    Location.stopUpdatingLocation();

    clearTimeout(this.afterRenderTimer);

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
      if (this.afterRenderTimer) {
        clearTimeout(this.afterRenderTimer);
      }
      this.afterRenderTimer = setTimeout(() => {
        const datasetSlugName = enabledDatasetSlug(this.props.areas[this.state.index]);
        this.setState({ datasetSlug: datasetSlugName });
        if (this.areaFeatures && this.areaFeatures.length > 0) {
          const areaCoordinates = this.getAreaCoordinates(this.areaFeatures[this.state.index]);
          this.map.fitToCoordinates(areaCoordinates,
            { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: true });
        }
      }, 300);
    }
  }

  onRegionChangeComplete = (region) => {
    this.updateRegion(region);
  }

  onRegionChange = (region) => {
    if (this.onRegionChangeTimer) {
      clearTimeout(this.onRegionChangeTimer);
    }
    this.onRegionChangeTimer = setTimeout(() => {
      this.updateRegion(region);
    }, 100);
  }

  onMapPress = (e) => {
    this.selectAlert(e.nativeEvent.coordinate);
  }

  getAreaCoordinates = (areaFeature) => (
    areaFeature.geometry.coordinates[0].map((coordinate) => (
      {
        longitude: coordinate[0],
        latitude: coordinate[1]
      }
    ))
  )

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

  updateSelectedArea(aId) {
    const area = this.props.areas[aId];
    this.setState({
      index: aId,
      areaCoordinates: this.getAreaCoordinates(this.areaFeatures[aId]),
      areaId: area.id,
      alertSelected: null,
      coordinates: {
        tile: [], // tile coordinates x, y, z + precision x, y
        precision: [] // tile precision x, y
      },
      datasetSlug: enabledDatasetSlug(area)
    }, () => {
      this.map.fitToCoordinates(this.getAreaCoordinates(this.areaFeatures[aId]),
        { edgePadding: { top: 250, right: 250, bottom: 250, left: 250 }, animated: false });
    });
  }

  selectAlert = (coordinates) => {
    const zoom = this.getMapZoom();
    if (zoom) {
      const tile = tilebelt.pointToTile(coordinates.longitude, coordinates.latitude, zoom, true);
      this.setState({
        alertSelected: coordinates,
        coordinates: {
          tile: [tile[0], tile[1], tile[2]],
          precision: [tile[3], tile[4]]
        }
      });
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

  updateRegion = (region) => {
    this.setState({ region });
    if (this.state.alertSelected) {
      this.updateSelectedAlertZoom();
    }
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
      (location) => {
        const coords = Platform.OS === 'ios' ? location.coords : location;
        this.setState({
          lastPosition: coords
        });
      }
    );

    if (Platform.OS === 'ios') {
      Location.startUpdatingHeading();
      this.eventOrientation = DeviceEventEmitter.addListener(
        'headingUpdated',
        (data) => {
          this.setState({ heading: parseInt(data.heading, 10) });
        }
      );
    } else {
      SensorManager.startOrientation(1000);
      this.eventOrientation = DeviceEventEmitter.addListener(
        'Orientation',
        (data) => {
          this.setState({
            heading: parseInt(data.azimuth, 10)
          });
        }
      );
    }
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

  removeAlertSelected = () => {
    this.setState({
      alertSelected: null
    });
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
  };

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
    const { coordinates, alertSelected } = this.state;
    const hasCoordinates = (coordinates.tile && coordinates.tile.length > 0) || false;
    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View
            style={styles.header}
            pointerEvents={'box-none'}
          >
            {alertSelected &&
              <Text style={styles.headerSubtitle}>
                {alertSelected.latitude.toFixed(4)}, {alertSelected.longitude.toFixed(4)}
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
            onRegionChange={this.onRegionChange}
            onRegionChangeComplete={this.onRegionChangeComplete}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
          >
            <MapView.Polyline
              coordinates={this.state.areaCoordinates}
              strokeColor={Theme.colors.color1}
              strokeWidth={2}
            />
            {this.state.lastPosition &&
              <MapView.Marker.Animated
                image={markerImage}
                coordinate={this.state.lastPosition}
                style={{ zIndex: 2 }}
                pointerEvents={'none'}
              />
            }
            {this.state.lastPosition && this.state.heading
              ?
                <MapView.Marker
                  key={'compass'}
                  coordinate={this.state.lastPosition}
                  zIndex={1}
                  anchor={{ x: 0.5, y: 0.6 }}
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
            <MapView.CanvasUrlTile
              urlTemplate="http://wri-tiles.s3.amazonaws.com/glad_prod/tiles/{z}/{x}/{y}.png"
              zIndex={-1}
              maxZoom={12}
              areaId={this.state.areaId}
              alertType={this.state.datasetSlug}
              isConnected={this.props.isConnected}
              minDate={daysSince(this.props.fromDate)}
              maxDate={daysSince(this.props.toDate)}
            />
            {hasCoordinates &&
              <MapView.CanvasInteractionUrlTile
                coordinates={coordinates}
                urlTemplate="http://wri-tiles.s3.amazonaws.com/glad_prod/tiles/{z}/{x}/{y}.png"
                zIndex={1}
                maxZoom={12}
                areaId={this.state.areaId}
                alertType={this.state.datasetSlug}
                isConnected={this.props.isConnected}
                minDate={daysSince(this.props.fromDate)}
                maxDate={daysSince(this.props.toDate)}
              />
            }
          </MapView>
          {this.state.alertSelected
            ? this.renderFooter()
            : this.renderFooterLoading()
          }
          <AreaCarousel
            areas={this.props.areas}
            alertSelected={this.state.alertSelected}
            lastPosition={this.state.lastPosition}
            updateSelectedArea={(areaId) => this.updateSelectedArea(areaId)}
          />
        </View>
      :
        renderLoading()
    );
  }
}

Map.propTypes = {
  navigator: React.PropTypes.object.isRequired,
  createReport: React.PropTypes.func.isRequired,
  isConnected: React.PropTypes.bool,
  geostores: React.PropTypes.object,
  fromDate: React.PropTypes.string,
  toDate: React.PropTypes.string,
  areas: React.PropTypes.array
};

export default Map;
