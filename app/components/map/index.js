import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  Dimensions,
  DeviceEventEmitter,
  Animated,
  StatusBar,
  Image,
  Text,
  Platform,
  TouchableHighlight
} from 'react-native';
import MapView from 'react-native-maps';
import GeoPoint from 'geopoint';
import I18n from 'locales';

import ActionBtn from 'components/common/action-button';
import Config from 'react-native-config';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

import { SensorManager } from 'NativeModules';
const { RNLocation: Location } = require('NativeModules');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const alertGladImage = require('assets/alert-glad.png');
const alertViirsmage = require('assets/alert-viirs.png');
const alertWhiteImage = require('assets/alert-white.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const backIconWhite = require('assets/previous_white.png');

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

function getGoogleMapsCoordinates(coordinates) {
  const cords = [];

  coordinates.forEach((cordinate) => {
    cords.push({
      latitude: cordinate.lat,
      longitude: cordinate.long
    });
  });

  return cords;
}

class Map extends Component {
  constructor(props) {
    super(props);
    const { params } = this.props.navigation.state;
    const intialCoords = params.center
      ? params.center
      : [Config.maps.lng, Config.maps.lat];

    this.state = {
      renderMap: false,
      lastPosition: null,
      region: {
        latitude: intialCoords.lat,
        longitude: intialCoords.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      alerts: params.features && params.features.length > 0 ? params.features.slice(0, 500) : [] // Provisional
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Map');
    StatusBar.setBarStyle('light-content');

    this.renderMap();
    this.geoLocate();
  }

  geoLocate() {
    Location.requestWhenInUseAuthorization();
    Location.startUpdatingLocation();

    DeviceEventEmitter.addListener(
      'locationUpdated',
      (location) => {
        this.setState({
          lastPosition: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });
      }
    );

    SensorManager.startOrientation(200);
    DeviceEventEmitter.addListener(
      'Orientation',
      (data) => {
        this.setState({
          heading: parseInt(data.azimuth, 10)
        });
      }
    );
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');
    Location.stopUpdatingLocation();

    if (Platform.OS === 'ios') {
      Location.stopUpdatingHeading();
    } else {
      SensorManager.stopOrientation();
    }
  }

  onLayout = () => {
    setTimeout(() => {
      const { params } = this.props.navigation.state;
      this.map.fitToCoordinates(getGoogleMapsCoordinates(params.features), {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true
      });
    }, 1000);
  }

  onAlertPress(alertSelected) {
    const alerts = [];

    this.state.alerts.forEach((alert) => {
      const newArea = Object.assign({}, alert);
      newArea.selected = alert.id === alertSelected.id;
      alerts.push(newArea);
    });

    this.setState({
      alerts,
      alertSelected
    });
  }

  startNavigation() {
    Location.requestWhenInUseAuthorization();
    Location.startUpdatingLocation();

    if (Platform.OS === 'ios') {
      DeviceEventEmitter.addListener(
        'locationUpdated',
        (position) => {
          this.setState({
            lastPosition: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        }
      );
    } else {
      DeviceEventEmitter.addListener(
        'locationUpdated',
        (location) => {
          this.setState({
            lastPosition: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          });
        }
      );
    }
  }

  renderMap() {
    if (!this.state.renderMap) {
      this.setState({
        renderMap: true
      });
    }
  }

  renderFooter() {
    let distanceText = I18n.t('commonText.notAvailable');
    let distance = 999999;
    const { lastPosition } = this.state;

    if (lastPosition) {
      const geoPoint = new GeoPoint(this.state.alertSelected.lat, this.state.alertSelected.long);
      const currentPoint = new GeoPoint(lastPosition.latitude, lastPosition.longitude);
      distance = currentPoint.distanceTo(geoPoint, true).toFixed(4);
      distanceText = `${distance} ${I18n.t('commonText.kmAway')}`; // in Kilometers
    }

    const createReport = () => {
      const form = `New-report-${Math.floor(Math.random() * 1000)}`;
      let latLng = '0,0';
      if (lastPosition) {
        latLng = `${lastPosition.latitude},${lastPosition.longitude}`;
      }
      this.props.createReport(form, latLng);
      this.props.navigateReset('NewReport', { form });
    };

    const reportBtn = (
      <ActionBtn
        style={styles.footerButton}
        text={I18n.t('report.title')}
        onPress={() => createReport()}
      />
    );
    return (
      <View style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        <Text style={styles.footerTitle}>
          {distanceText}
        </Text>
        {reportBtn}
      </View>
    );
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          <View
            style={styles.header}
            pointerEvents={'box-none'}
          >
            <Image
              style={styles.headerBg}
              source={backgroundImage}
            />
            <Text style={styles.headerTitle}>
              {params.title}
            </Text>
            <TouchableHighlight
              style={styles.headerBtn}
              onPress={() => this.props.navigation.goBack()}
              underlayColor="transparent"
              activeOpacity={0.8}
            >
              <Image style={Theme.icon} source={backIconWhite} />
            </TouchableHighlight>
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            initialRegion={this.state.region}
            onLayout={this.onLayout}
            moveOnMarkerPress={false}
          >
            {this.state.lastPosition &&
              <MapView.Marker.Animated
                image={markerImage}
                coordinate={this.state.lastPosition}
                style={{ zIndex: 2 }}
                pointerEvents={'none'}
              />
            }
            {this.state.lastPosition
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
            {this.state.alerts.map((point, key) => {
              let image = alertGladImage;

              if (point.type === 'viirs') {
                image = alertViirsmage;
              }

              if (point.selected) {
                image = alertWhiteImage;
              }

              return (
                <MapView.Marker.Animated
                  key={key}
                  image={image}
                  style={{ opacity: 0.8 }}
                  coordinate={{
                    latitude: point.lat,
                    longitude: point.long
                  }}
                  onPress={() => this.onAlertPress(point)}
                />
              );
            })
            }
          </MapView>
          {this.state.alertSelected
            ? this.renderFooter()
            : null
          }
        </View>
      :
        renderLoading()
    );
  }
}

Map.propTypes = {
  navigation: React.PropTypes.object.isRequired,
  navigateReset: React.PropTypes.func.isRequired,
  createReport: React.PropTypes.func.isRequired
};

Map.navigationOptions = {
  header: {
    visible: false
  }
};

export default Map;
