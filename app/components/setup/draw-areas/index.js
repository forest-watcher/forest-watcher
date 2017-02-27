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
import { storeImage, parseImagePath } from 'helpers/fileManagement';

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
const markerImage = require('assets/marker.png');

function parseCoordinates(coordinates) {
  return coordinates.map((cordinate) => ({
    latitude: cordinate.latitude,
    longitude: cordinate.longitude
  }));
}

function getGoogleMapsCoordinates(coordinates) {
  return coordinates.map((cordinate) => ({
    latitude: cordinate[1],
    longitude: cordinate[0]
  }));
}

function getGeoJson(coordinates) {
  const firstGeo = [coordinates[0].longitude, coordinates[0].latitude];
  const geoCordinates = coordinates.map((item) => [item.longitude, item.latitude]);
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

  componentDidMount() {
    tracker.trackScreenView('Draw Areas');
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
        this.props.onDrawAreaFinish({ geostore }, parseImagePath(storedUrl));
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

  getLegend() {
    const finished = this.state.shape.coordinates.length >= 3;
    if (!finished) return <Text style={styles.footerTitle}>{I18n.t('setupDrawAreas.tapInstruction')}</Text>;

    const valid = false; // TODO: check valid geojson
    return (valid)
      ? <ActionButton style={styles.footerButton} onPress={this.onNextPress} text={I18n.t('commonText.next')} />
      : <ActionButton style={styles.footerButton} onPress={this.clearShape} text={I18n.t('setupDrawAreas.resetShape')} />;
  }

  clearShape = () => {
    this.setState({ shape: { coordinates: [] } });
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
    const markers = parseCoordinates(coordinates);

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
          {markers.length >= 0 &&
            markers.map((marker, index) => (
              <MapView.Marker key={index} coordinate={marker} anchor={{ x: 0.5, y: 0.5 }}>
                <Image
                  style={{ width: 8, height: 8 }}
                  source={markerImage}
                />
              </MapView.Marker>
            ))
          }
        </MapView>
        <View style={styles.footer}>
          <Image
            style={styles.footerBg}
            source={footerBackgroundImage}
          />
          {this.getLegend()}
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
