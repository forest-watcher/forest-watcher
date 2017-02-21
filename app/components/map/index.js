import React, { Component } from 'react';
import {
  View,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import MapView from 'react-native-maps';

import Config from 'react-native-config';
import Theme from 'config/theme';
import styles from './styles';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 30;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const markerImage = require('assets/marker.png');
const alertGladImage = require('assets/alert-glad.png');

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
        latitude: intialCoords.lat,
        longitude: intialCoords.lon,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
    this.watchID = null;
  }

  componentDidMount() {
    this.renderMap();
    this.startNavigation();
  }

  onLayout = () => {
    const { params } = this.props.navigation.state;
    const boundaries = params.geojson.geometry.coordinates[0];
    this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true
    });
  }

  startNavigation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          lastPosition: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });
      },
      (error) => console.log(JSON.stringify(error)),
      { enableHighAccuracy: true, timeout: 500, maximumAge: 60 }
    );
    this.watchID = navigator.geolocation.watchPosition((position) => {
      // const lat1 = 40.420106;
      // const lon1 = 3.698136;
      // const lat2 = 40.419542;
      // const lon2 = -3.698130;
      // const distance = Math.atan2(
      //   Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1),
      //   Math.sin(lon2 - lon1)* Math.cos(lat2));
      // const degrees = distance * (180 / Math.PI);
      // const heading = (degrees + 360) % 360;
      // console.log(distance);
      // console.log(distance, degrees);

      this.setState({
        lastPosition: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
          // rotation: heading
        }
      });
    });
  }

  renderMap() {
    if (!this.state.renderMap) {
      this.setState({
        renderMap: true
      });
    }
  }

  render() {
    const { params } = this.props.navigation.state;

    return (
      this.state.renderMap
      ?
        <View style={styles.container}>
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
              />
            }
            {params.features.map((point, key) =>
              (
                <MapView.Marker.Animated
                  key={key}
                  image={alertGladImage}
                  style={{ opacity: 0.8 }}
                  coordinate={{
                    latitude: point.lat,
                    longitude: point.long
                  }}
                />
              )
            )
            }
          </MapView>
        </View>
      :
        renderLoading()
    );
  }
}

Map.propTypes = {
  navigation: React.PropTypes.object.isRequired
};

export default Map;
