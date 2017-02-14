import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  Dimensions,
  ActivityIndicator
} from 'react-native';

import Config from 'react-native-config';
import MapView from 'react-native-maps';
import { storeImage } from 'helpers/fileManagement';

import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import I18n from 'locales';
import styles from './styles';

const sections = [
  {
    title: I18n.t('commonText.next'),
    section: '',
    image: ''
  },
  {
    title: I18n.t('setupDrawAreas.tapInstruction'),
    section: '',
    image: ''
  }
];

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

function getGeoJson(coordinates) {
  const firstGeo = [coordinates[0].latitude, coordinates[0].longitude];
  const geoCordinates = coordinates.map((item) => [item.latitude, item.longitude]);
  geoCordinates.push(firstGeo);
  return {
    type: 'Polygon',
    coordinates: [geoCordinates]
  };
}

function saveGeoJson(geojson) {
  const fetchConfig = {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      lock: true,
      geojson
    })
  };
  const url = `${Config.API_URL}/geostore`;
  return fetch(url, fetchConfig);
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

class DrawAreas extends Component {
  constructor(props) {
    super(props);
    const intialCoords = this.props.country && this.props.country.centroid
      ? this.props.country.centroid.coordinates
      : [Config.maps.lng, Config.maps.lat];

    this.bboxed = false;
    this.state = {
      loading: false,
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

  onMapPress(e) {
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

  onNextPress = () => {
    this.setState({ loading: true });
    saveGeoJson(getGeoJson(this.state.shape.coordinates))
      .then(res => {
        if (res.ok) return res.json();
        throw res;
      })
      .then(async (response) => {
        const geostore = response.data && response.data.id;
        const snapshot = await this.takeSnapshot();
        const url = snapshot.uri ? snapshot.uri : snapshot;
        const storedUrl = await storeImage(url);
        this.props.onDrawAreaFinish({ geostore }, storedUrl);
      })
      .catch((error) => console.warn(error));
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

  takeSnapshot() {
    return this.map.takeSnapshot({
      height: 224,
      format: 'png',
      quality: 0.8,
      result: 'file'
    });
  }

  render() {
    const { coordinates } = this.state.shape;
    const finished = coordinates.length >= 3;
    return (
      <View style={styles.container}>
        {this.state.loading
          ? renderLoading()
          : null
        }
        <MapView
          ref={(ref) => { this.map = ref; }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="hybrid"
          rotateEnabled={false}
          initialRegion={this.state.region}
          onPress={e => this.onMapPress(e)}
          onRegionChangeComplete={this.setBoundaries}
        >
          {coordinates.length > 0 && (
            <MapView.Polygon
              key={0}
              coordinates={coordinates}
              strokeColor={Theme.polygon.stroke}
              fillColor={Theme.polygon.fill}
              strokeWidth={Theme.polygon.strokeWidth}
            />
          )}
        </MapView>
        <View style={styles.footer}>
          <Image
            style={styles.footerBg}
            source={footerBackgroundImage}
          />
          {finished
            ? <ActionButton style={styles.footerButton} onPress={this.onNextPress} text={sections[0].title} />
            : <Text style={styles.footerTitle}>
              {sections[1].title}
            </Text>
          }
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
  onDrawAreaFinish: React.PropTypes.func.isRequired
};

export default DrawAreas;
