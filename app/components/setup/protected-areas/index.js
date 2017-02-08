import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  Dimensions,
  InteractionManager
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
  constructor(props) {
    super(props);
    const intialCoords = this.props.country && this.props.country.centroid
      ? this.props.country.centroid.coordinates
      : [Config.maps.lng, Config.maps.lat];
    this.region = {};
    this.state = {
      data: [],
      loaded: false,
      country: null,
      region: {
        latitude: intialCoords[1],
        longitude: intialCoords[0],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
  }

  componentDidMount() {
    if (this.state.data && !this.state.data.length > 0) {
      InteractionManager.runAfterInteractions(() => {
        this.fetchData();
      });
    }
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
        edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
        animated: true
      });
      this.props.onAreaSelected({
        wdpaid: areaSelected.properties.wdpa_pid
      });
    });
  }

  onRegionChanged(region) {
    this.region = region;
  }

  setBoundaries() {
    let boundaries = Config.bbox;
    if (this.props.country && this.props.country.bbox) {
      boundaries = this.props.country.bbox.coordinates[0];
    }
    this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
      edgePadding: { top: 0, right: 0, bottom: 0, left: 0 },
      animated: true
    });
  }

  fetchData() {
    const filter = this.props.country.iso
      ? `WHERE iso3 = '${this.props.country.iso}'`
      : '';
    const url = `${Config.CARTO_URL}?q=
      SELECT the_geom, cartodb_id, iucn_cat, iso3, wdpa_pid,
      ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid,
      ST_AsGeoJSON(ST_Envelope(the_geom)) as boundaries
      FROM wdpa_protected_areas ${filter} LIMIT 10&format=geojson`;

    fetch(url)
      .then(response => response.json())
      .then((responseData) => {
        this.setBoundaries();
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
    return (
      <View style={styles.container}>
        <MapView
          ref={(ref) => { this.map = ref; }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="hybrid"
          rotateEnabled={false}
          onRegionChangeComplete={region => this.onRegionChanged(region)}
          initialRegion={this.state.region}
        >
          {this.state.data.map((polygon, key) => (
            <MapView.Polygon
              key={`${polygon.properties.iso3}-${key}`}
              coordinates={getGoogleMapsCoordinates(polygon.geometry.coordinates[0][0])}
              strokeColor={!polygon.selected
                ? Theme.polygon.stroke : Theme.polygon.strokeSelected}
              fillColor={!polygon.selected
                ? Theme.polygon.fill : Theme.polygon.fillSelected}
              strokeWidth={2}
              onPress={() => this.onProtectedArea(polygon)}
            />
          ))}
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

ProtectedAreas.propTypes = {
  country: React.PropTypes.shape({
    iso: React.PropTypes.string.isRequired,
    bbox: React.PropTypes.object.isRequired,
    centroid: React.PropTypes.object.isRequired
  }).isRequired,
  onAreaSelected: React.PropTypes.func.isRequired
};

export default ProtectedAreas;
