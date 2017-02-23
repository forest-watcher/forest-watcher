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
  Platform
} from 'react-native';
import MapView from 'react-native-maps';
import GeoPoint from 'geopoint';

import Config from 'react-native-config';
import Theme from 'config/theme';
import styles from './styles';

const { RNLocation: Location } = require('NativeModules');
const ReactNativeHeading = require('react-native-heading');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.005;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const alertGladImage = require('assets/alert-glad.png');
const alertGladWhiteImage = require('assets/alert-glad-white.png');
const compassImage = require('assets/compass_direction.png');
const backgroundImage = require('assets/map_bg_gradient.png');

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
      alerts: fakeAlerts,
      geo: ''
    };
    this.watchID = null;
  }

  componentDidMount() {
    StatusBar.setBarStyle('light-content');

    this.renderMap();
    this.startNavigation();
    this.startHeading();
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');

    if (Platform.OS === 'ios') {
      Location.stopUpdatingLocation();
      Location.stopUpdatingHeading();
    } else {
      navigator.geolocation.clearWatch(this.watchID);
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

  async startHeading() {
    if (Platform.OS === 'ios') {
      Location.startUpdatingLocation();
      Location.startUpdatingHeading();
      Location.setDesiredAccuracy(1);
      Location.setDistanceFilter(1);
    } else {
      const heading = await ReactNativeHeading.start(1);
      this.setState({ geo: this.state.geo + ' HEADING ENABLED: ' + JSON.stringify(heading) });
    }

    DeviceEventEmitter.addListener(
      'headingUpdated',
      (data) => {
        this.setState({
          heading: Math.round(data.heading),
          geo: this.state.geo + ' HEADING ' + JSON.stringify(Math.round(data.heading))
        });
      }
    );
  }

  startNavigation() {
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            geo: this.state.geo + JSON.stringify(position),
            lastPosition: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => this.setState({ geo: this.state.geo + ' ERROR ' + JSON.stringify(error) }),
        { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 },
      );

      this.watchID = navigator.geolocation.watchPosition(
        (position) => {
          this.setState({
            geo: this.state.geo + JSON.stringify(position),
            lastPosition: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => this.setState({ geo: this.state.geo + ' ERROR ' + JSON.stringify(error) }),
        { enableHighAccuracy: true, timeout: 60000, maximumAge: 0, distanceFilter: 1 }
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

  renderDistance() {
    let distance = 'Not Available';

    if (this.state.lastPosition) {
      const geoPoint = new GeoPoint(this.state.alertSelected.latitude, this.state.alertSelected.longitude);
      const currentPoint = new GeoPoint(this.state.lastPosition.latitude, this.state.lastPosition.longitude);
      distance = `${parseFloat(currentPoint.distanceTo(geoPoint, true)).toFixed(4)}km away`; // in Kilometers
    }

    return (
      <View style={styles.footer}>
        <Image
          style={styles.footerBg}
          source={backgroundImage}
        />
        <Text style={styles.footerTitle}>
          {distance}
        </Text>
      </View>
    );
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
          {this.state.geo.length > 0 &&
            <View style={{ zIndex: 100, width: 300, height: 300, backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <Text>{this.state.geo}</Text>
            </View>
          }
          <View
            style={styles.header}
            pointerEvents={'none'}
          >
            <Image
              style={styles.headerBg}
              source={backgroundImage}
            />
            <Text
              style={styles.headerTitle}
            >
              {params.title}
            </Text>
          </View>
          <MapView
            ref={(ref) => { this.map = ref; }}
            style={styles.map}
            provider={MapView.PROVIDER_GOOGLE}
            mapType="hybrid"
            rotateEnabled={false}
            initialRegion={this.state.region}
            onLayout={this.onLayout}
          >
            {this.state.lastPosition &&
              <MapView.Marker.Animated
                image={markerImage}
                coordinate={this.state.lastPosition}
                style={{ zIndex: 2 }}
              />
            }
            {this.state.lastPosition
              ?
                <MapView.Marker
                  key={'compass'}
                  coordinate={this.state.lastPosition}
                  zIndex={1}
                  anchor={{ x: 0.5, y: 0.6 }}
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
            ? this.renderDistance()
            : null
          }
        </View>
      :
        renderLoading()
    );
  }
}

Map.propTypes = {
  navigation: React.PropTypes.object.isRequired
};

Map.navigationOptions = {
  header: {
    visible: false
  }
};

export default Map;
