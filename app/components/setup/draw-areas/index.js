import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  Dimensions
} from 'react-native';

import Config from 'react-native-config';
import MapView from 'react-native-maps';
import Theme from 'config/theme';
import styles from './styles';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 30;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const footerBackgroundImage = require('assets/map_bg_gradient.png');

function getGoogleMapsCoordinates(coordinates) {
  return coordinates.map((cordinate) => ({
    latitude: cordinate[1],
    longitude: cordinate[0]
  }));
}

class DrawAreas extends Component {
  constructor(props) {
    super(props);
    const intialCoords = this.props.country && this.props.country.centroid
      ? this.props.country.centroid.coordinates
      : [Config.maps.lng, Config.maps.lat];

    this.bboxed = false;
    this.state = {
      shape: {
        coordinates: []
      },
      region: {
        latitude: intialCoords[1],
        longitude: intialCoords[0],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
  }

  onPress(e) {
    const { shape } = this.state;
    this.setState({
      shape: {
        ...shape,
        coordinates: [
          ...shape.coordinates,
          e.nativeEvent.coordinate
        ]
      }
    });
  }

  setBoundaries = () => {
    if (!this.bboxed) {
      this.bboxed = true;
      let boundaries = Config.bbox;
      if (this.props.country && this.props.country.bbox) {
        boundaries = this.props.country.bbox.coordinates[0];
      }
      this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
        edgePadding: { top: 0, right: 0, bottom: 0, left: 0 },
        animated: true
      });
    }
  }

  render() {
    const { coordinates } = this.state.shape;
    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => { this.map = ref; }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="hybrid"
          rotateEnabled={false}
          initialRegion={this.state.region}
          onPress={e => this.onPress(e)}
          onRegionChangeComplete={this.setBoundaries}
        >
          {coordinates.length > 0 && (
            <MapView.Polygon
              key={0}
              coordinates={coordinates}
              strokeColor={Theme.polygon.stroke}
              fillColor={Theme.polygon.fill}
              strokeWidth={1}
            />
          )}
        </MapView>
        <View style={styles.footer}>
          <Image
            style={styles.footerBg}
            source={footerBackgroundImage}
          />
          <Text style={styles.footerTitle}>
            Select an area to continue
          </Text>
        </View>
      </View>
    );
  }
}

DrawAreas.propTypes = {
  country: React.PropTypes.shape({
    iso: React.PropTypes.string.isRequired,
    bbox: React.PropTypes.object.isRequired,
    centroid: React.PropTypes.object.isRequired
  }).isRequired,
  onAreaDrawed: React.PropTypes.func.isRequired
};

export default DrawAreas;
