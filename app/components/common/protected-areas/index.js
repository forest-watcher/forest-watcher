import React, { Component } from 'react';
import {
  Modal,
  View,
  Text,
  Dimensions,
  InteractionManager,
  Image,
  TouchableHighlight
} from 'react-native';

import Config from 'react-native-config';
import MapView from 'react-native-maps';
import Theme from 'config/theme';
import styles from './styles';

const headerBackgroundImage = require('assets/map_bg_gradient.png');
const closeImage = require('assets/close_white.png');

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
    this.selectedTimer = null;
    this.region = {};
    this.state = {
      visible: this.props.visible,
      data: [],
      loaded: false,
      iso: null,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
  }

  componentWillReceiveProps(newProps) {
    if (newProps.visible) {
      this.setState({ visible: newProps.visible });
    }
    if (!this.state.iso && (this.state.iso !== newProps.iso)) {
      this.getData();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.selectedTimer);
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
        animated: false
      });
      this.props.onAreaSelected({
        wdpaid: areaSelected.properties.wdpa_pid
      });
      this.setCloseTimer();
    });
  }

  onRegionChanged(region) {
    this.region = region;
  }

  getData() {
    InteractionManager.runAfterInteractions(() => {
      if (!this.state.data.length > 0 && !this.state.loaded) {
        this.fetchData();
      }
    });
  }

  setCloseTimer() {
    if (this.selectedTimer) {
      clearTimeout(this.selectedTimer);
    }
    this.selectedTimer = setTimeout(() => {
      this.close();
    }, 2000);
  }

  close() {
    this.setState({
      visible: false
    });
  }

  fetchData() {
    const filter = this.props.iso
      ? `WHERE iso3 = '${this.props.iso}'`
      : '';
    const url = `${Config.CARTO_URL}?q=
      SELECT the_geom, cartodb_id, iucn_cat, iso3, wdpa_pid,
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
    return (
      <Modal
        animationType={'slide'}
        transparent
        visible={this.state.visible}
        onRequestClose={() => this.close()}
      >
        <View style={styles.header}>
          <Image
            style={styles.headerBg}
            source={headerBackgroundImage}
          />
          <Text style={styles.headerTitle}>
            Select a protected area
          </Text>
          <TouchableHighlight
            style={styles.closeIcon}
          >
            <Image style={Theme.icon} source={closeImage} />
          </TouchableHighlight>
        </View>
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
            source={headerBackgroundImage}
          />
          <Text style={styles.footerTitle}>
            Select an area to continue
          </Text>
        </View>
      </Modal>
    );
  }
}

ProtectedAreas.propTypes = {
  iso: React.PropTypes.string,
  visible: React.PropTypes.bool,
  onAreaSelected: React.PropTypes.func.isRequired
};

export default ProtectedAreas;
