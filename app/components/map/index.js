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
  }

  componentDidMount() {
    this.renderMap();
  }

  onLayout = () => {
    // const { params } = this.props.navigation.state;
    // const boundaries = params.geojson.geometry.coordinates[0];
    // this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
    //   edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
    //   animated: true
    // });
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
