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
    this.region = {};
    this.state = {
      data: [],
      loaded: false,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
  }

  componentDidMount() {
  }

  onOptionSelected() {
  }

  onProtectedArea(areaSelected) {
    const areas = [];

    this.state.data.forEach((area) => {
      const newArea = Object.assign({}, area);
      newArea.selected = area.properties.cartodb_id === areaSelected.properties.cartodb_id;
      areas.push(newArea);
    });

    this.setState({
      data: areas,
      region: this.region
    }, () => {
      const boundaries = JSON.parse(areaSelected.properties.boundaries).coordinates[0];
      this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true
      });
    });
  }

  onRegionChanged(region) {
    this.region = region;
  }

  fetchData() {
    const filter = this.props.iso
      ? `WHERE iso3 = '${this.props.iso}'`
      : '';
    const url = `${Config.CARTO_URL}?q=
      SELECT the_geom, cartodb_id, iucn_cat, iso3,
      ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid,
      ST_AsGeoJSON(ST_Envelope(the_geom)) as boundaries
      FROM wdpa_protected_areas ${filter} LIMIT 10&format=geojson`;

    fetch(url)
      .then(response => response.json())
      .then((responseData) => {
        this.setState({
          data: responseData.features,
          loaded: true
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
        StatusBar.setBarStyle('dark-content', true);

        if (!this.state.data.length > 0 && !this.state.loaded) {
          this.fetchData();
        }
      }
    });

    this.state.data.forEach((polygon) => {
      getGoogleMapsCoordinates(polygon.geometry.coordinates[0][0]);
    });

    return (
      <Modal
        animationType={'slide'}
        transparent
        visible={this.props.visible}
        onRequestClose={() => this.onOptionSelected()}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Select a protected area
          </Text>
        </View>
        <MapView
          ref={(ref) => { this.map = ref; }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="hybrid"
          rotateEnabled={false}
          onRegionChangeComplete={region => this.onRegionChanged(region)}
          region={this.state.region}
        >
          {this.state.data.map((polygon, key) => (
            <MapView.Polygon
              key={`${polygon.properties.iso3}-${key}`}
              coordinates={getGoogleMapsCoordinates(polygon.geometry.coordinates[0][0])}
              strokeColor={!polygon.selected ? '#97be32' : '#FFFFFF'}
              fillColor={!polygon.selected ? 'rgba(151, 190, 49, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
              strokeWidth={2}
              onPress={() => this.onProtectedArea(polygon)}
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
