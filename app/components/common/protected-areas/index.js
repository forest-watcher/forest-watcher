import React, { Component } from 'react';
import {
  Modal,
  View,
  Text,
  Dimensions,
  InteractionManager,
  StatusBar
} from 'react-native';

import Config from 'react-native-config';
import MapView from 'react-native-maps';
import styles from './styles';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 4.931654;
const LONGITUDE = -64.958867;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

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

class ProtectedAreas extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: []
    };
  }

  componentDidMount() {
  }

  onOptionSelected() {
  }

  onProtectedArea(content, lala) {
    console.warn(content, lala);
  }

  fetchData() {
    const filter = this.props.iso
      ? `WHERE iso3 = '${this.props.iso}'`
      : '';
    const url = `${Config.CARTO_URL}?q=
      SELECT the_geom, the_geom_webmercator, iucn_cat, iso3
      FROM wdpa_protected_areas ${filter} LIMIT 10&format=geojson`;

    console.log(url);

    fetch(url)
      .then(response => response.json())
      .then((responseData) => {
        this.setState({
          data: responseData.features
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  }

  render() {
    InteractionManager.runAfterInteractions(() => {
      if (this.props.visible) {
        StatusBar.setBarStyle('light-content', true);

        if (!this.state.data.length > 0) {
          console.log('get data');
          this.fetchData();
        }
      }
    });

    this.state.data.forEach((polygon) => {
      console.log(polygon);
      getGoogleMapsCoordinates(polygon.geometry.coordinates[0][0]);
    });

    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.props.visible}
        onRequestClose={() => this.onOptionSelected()}
      >
        <View><Text>Hi</Text></View>
        <MapView
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="hybrid"
          rotateEnabled={false}
          region={{
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
          }}
        >
          {this.state.data.map((polygon, key) => (
            <MapView.Polygon
              key={`${polygon.properties.iso3}-${key}`}
              coordinates={getGoogleMapsCoordinates(polygon.geometry.coordinates[0][0])}
              strokeColor={'#97be32'}
              fillColor={'rgba(151, 190, 49, 0.5)'}
              strokeWidth={2}
              onPress={this.onProtectedArea}
            />
          ))}
        </MapView>
      </Modal>
    );
  }
}

ProtectedAreas.propTypes = {
  iso: React.PropTypes.string,
  visible: React.PropTypes.bool
};

export default ProtectedAreas;
