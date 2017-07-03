import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  Dimensions,
  Animated,
  InteractionManager
} from 'react-native';

import CONSTANTS from 'config/constants';
import Config from 'react-native-config';
import MapView from 'react-native-maps';

import { storeImage } from 'helpers/fileManagement';
import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
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

function renderLoading() {
  return (
    <View
      style={styles.loader}
      pointerEvents={'none'}
    >
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size={'large'}
      />
    </View>
  );
}

class ProtectedAreas extends Component {
  constructor(props) {
    super(props);
    const intialCoords = this.props.country && this.props.country.centroid
      ? this.props.country.centroid.coordinates
      : [CONSTANTS.maps.lng, CONSTANTS.maps.lat];
    this.region = {};
    this.state = {
      data: [],
      loaded: false,
      animationButtonBottom: new Animated.Value(-80),
      country: null,
      wdpa: null,
      region: {
        latitude: intialCoords[1],
        longitude: intialCoords[0],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Protected Area');
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
      region: this.region,
      wdpa: areaSelected.properties
    }, () => {
      const boundaries = JSON.parse(areaSelected.properties.boundaries).coordinates[0];
      Animated.timing(
        this.state.animationButtonBottom,
        { toValue: 1 }
      ).start();
      this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
        edgePadding: { top: 110, right: 110, bottom: 110, left: 110 },
        animated: true
      });
    });
  }

  onRegionChanged(region) {
    this.region = region;
  }

  onAreaSelected = () => {
    const areas = [];

    this.state.data.forEach((area) => {
      const newArea = Object.assign({}, area);
      if (this.state.wdpa.cartodb_id === area.properties.cartodb_id) {
        newArea.selected = false;
      } else {
        newArea.hidden = true;
      }
      areas.push(newArea);
    });

    this.setState({
      loaded: false,
      data: areas
    }, async () => {
      const snapshot = await this.takeSnapshot();
      const url = snapshot.uri ? snapshot.uri : snapshot;
      const storedUrl = await storeImage(url);

      this.props.onAreaSelected({
        wdpaid: this.state.wdpa.wdpa_pid,
        wdpaName: this.state.wdpa.name
      }, storedUrl);
    });
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

  takeSnapshot() {
    return this.map.takeSnapshot({
      height: 500,
      format: 'png',
      quality: 0.8,
      result: 'file'
    });
  }

  fetchData() {
    const filter = this.props.country.iso
      ? `WHERE iso3 = '${this.props.country.iso}'`
      : '';
    const url = `${Config.CARTO_URL}?q=
      SELECT the_geom, cartodb_id, name, iso3, wdpa_pid,
      ST_AsGeoJSON(ST_Centroid(the_geom)) as centroid,
      ST_AsGeoJSON(ST_Envelope(the_geom)) as boundaries
      FROM wdpa_protected_areas ${filter}&format=geojson`;

    fetch(url)
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((responseData) => {
        // this.setBoundaries(); Disabled by now
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
        {!this.state.loaded
          ? renderLoading()
          : null
        }
        <MapView
          ref={(ref) => { this.map = ref; }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="hybrid"
          rotateEnabled={false}
          onRegionChangeComplete={region => this.onRegionChanged(region)}
          initialRegion={this.state.region}
        >
          {this.state.data.map((polygon, key) => {
            let fillColor = !polygon.selected
              ? Theme.polygon.fill : Theme.polygon.fillSelected;
            let strokeColor = !polygon.selected
              ? Theme.polygon.stroke : Theme.polygon.strokeSelected;

            if (polygon.hidden) {
              fillColor = 'transparent';
              strokeColor = 'transparent';
            }

            return (
              <MapView.Polygon
                key={`${polygon.properties.iso3}-${key}`}
                coordinates={getGoogleMapsCoordinates(polygon.geometry.coordinates[0][0])}
                strokeColor={strokeColor}
                fillColor={fillColor}
                strokeWidth={Theme.polygon.strokeWidth}
                tappable
                onPress={() => this.onProtectedArea(polygon)}
              />
            );
          })
        }
        </MapView>
        <View style={styles.footer}>
          <Image
            style={styles.footerBg}
            source={footerBackgroundImage}
          />
          {!this.state.wdpa
            ? <Text style={styles.footerTitle}>
              {I18n.t('setupProtectedAreas.instruction')}
            </Text>
            : null
          }
          <Animated.View
            style={[styles.footerButtonContainer, { bottom: this.state.animationButtonBottom }]}
          >
            <ActionButton
              light
              style={styles.footerButton}
              onPress={this.onAreaSelected}
              text={this.state.wdpa ? this.state.wdpa.name : ''}
            />
          </Animated.View>
        </View>
      </View>
    );
  }
}

ProtectedAreas.propTypes = {
  country: PropTypes.shape({
    iso: PropTypes.string.isRequired,
    bbox: PropTypes.object.isRequired,
    centroid: PropTypes.object.isRequired
  }).isRequired,
  onAreaSelected: PropTypes.func.isRequired
};

export default ProtectedAreas;
