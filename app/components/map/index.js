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
import i18n from 'locales';

import ActionBtn from 'components/common/action-button';
import Config from 'react-native-config';
import Theme from 'config/theme';
import styles from './styles';

import { SensorManager } from 'NativeModules';
// const ReactNativeHeading = require('react-native-heading');
const { RNLocation: Location } = require('NativeModules');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const alertGladImage = require('assets/alert-glad.png');
const alertGladWhiteImage = require('assets/alert-glad-white.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');
const backIconWhite = require('assets/previous_white.png');

const fakeAlerts = [
  {
    id: 0,
    latitude: 40.435853,
    longitude: -3.700819,
    pressed: false
  },
  {
    id: 1,
    latitude: 40.435923,
    longitude: -3.702375,
    pressed: false
  },
  {
    id: 2,
    latitude: 40.435102,
    longitude: -3.702058,
    pressed: false
  },
  {
    id: 3,
    latitude: 40.434383,
    longitude: -3.701061,
    pressed: false
  },
  {
    id: 3,
    latitude: 40.432820,
    longitude: -3.701044,
    pressed: false
  }
];

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
      latitude: cordinate[1],
      longitude: cordinate[0]
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
      region: {
        // latitude: intialCoords.lat,
        // longitude: intialCoords.lon,
        latitude: 40.434617,
        longitude: -3.700523,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      alerts: fakeAlerts
    };
  }

  componentDidMount() {
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

    SensorManager.startOrientation(500);
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
    // const { params } = this.props.navigation.state;
    // const boundaries = params.geojson.geometry.coordinates[0];
    // this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
    //   edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
    //   animated: true
    // });
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
          console.log(location);
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

  // {params.features.map((point, key) =>
  //   (
  //     <MapView.Marker.Animated
  //       key={key}
  //       image={alertGladImage}
  //       style={{ opacity: 0.8 }}
  //       coordinate={{
  //         latitude: point.lat,
  //         longitude: point.long
  //       }}
  //     />
  //   )
  // )
  // }

  renderFooter() {
    let distanceText = 'Not Available';
    let distance = 999999;
    const latLng = [this.state.lastPosition.latitude, this.state.lastPosition.longitude];

    if (this.state.lastPosition) {
      const geoPoint = new GeoPoint(this.state.alertSelected.latitude, this.state.alertSelected.longitude);
      const currentPoint = new GeoPoint(latLng[0], latLng[1]);
      distance = currentPoint.distanceTo(geoPoint, true).toFixed(4);
      distanceText = `${distance} km away`; // in Kilometers
    }

    const createReport = () => {
      const form = `New-report-${Math.floor(Math.random() * 1000)}`;
      this.props.createReport(form, `${latLng[0]},${latLng[1]}`);
      this.props.navigation.navigate('NewReport', { form });
    };

    let reportBtn = null;
    if (distance <= 1) {
      reportBtn = (
        <ActionBtn
          style={styles.footerButton}
          text={i18n.t('report.title')}
          onPress={() => createReport()}
        />
      );
    }
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
              const image = point.selected ? alertGladWhiteImage : alertGladImage;
              return (
                <MapView.Marker.Animated
                  key={key}
                  image={image}
                  style={{ opacity: 0.8 }}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude
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
  createReport: React.PropTypes.func.isRequired
};

Map.navigationOptions = {
  header: {
    visible: false
  }
};

export default Map;
