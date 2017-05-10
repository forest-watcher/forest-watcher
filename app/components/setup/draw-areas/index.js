import React, { Component } from 'react';
import {
  View,
  Image,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableHighlight
} from 'react-native';

import CONSTANTS from 'config/constants';
import Config from 'react-native-config';
import MapView from 'react-native-maps';
import gpsi from 'geojson-polygon-self-intersections';
import { storeImage } from 'helpers/fileManagement';

import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const geojsonArea = require('@mapbox/geojson-area');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 30;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const footerBackgroundImage = require('assets/map_bg_gradient.png');
const markerImage = require('assets/circle.png');
// const markerRedImage = require('assets/circle_red.png');
const undoImage = require('assets/undo.png');

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
      : [CONSTANTS.maps.lng, CONSTANTS.maps.lat];

    this.bboxed = false;
    this.state = {
      loading: false,
      valid: true,
      huge: false,
      shape: {
        coordinates: []
      },
      region: {
        latitude: intialCoords[1],
        longitude: intialCoords[0],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      snapshot: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Draw Areas');
  }

  componentWillUnmount() {
    if (this.afterRenderTimer) {
      clearTimeout(this.afterRenderTimer);
    }
  }

  onMapPress(e) {
    if (e.nativeEvent.coordinate) {
      const { shape, valid } = this.state;
      const coords = [
        ...shape.coordinates,
        e.nativeEvent.coordinate
      ];
      let isValid = valid;
      let isHuge = false;

      if (coords.length >= 3) {
        const intersects = gpsi({
          type: 'Feature',
          geometry: getGeoJson(coords)
        });

        if ((intersects && intersects.geometry) &&
        intersects.geometry.coordinates.length > 0) {
          isValid = false;
        }
        const area = geojsonArea.geometry(getGeoJson(coords));
        if (area > CONSTANTS.areas.maxSize) {
          isHuge = true;
        }
      }

      this.setState({
        shape: {
          ...shape,
          coordinates: coords
        },
        valid: isValid,
        huge: isHuge
      });
    }
  }

  onNextPress = () => {
    this.setState({ loading: true, snapshot: true });
    saveGeoJson(getGeoJson(this.state.shape.coordinates))
      .then(res => {
        if (res.ok) return res.json();
        throw new Error(res.statusText);
      })
      .then(async (response) => {
        const geostore = response.data && response.data.id;
        this.props.storeGeostore(geostore, response.data.attributes.geojson);
        const snapshot = await this.takeSnapshot();
        const url = snapshot.uri ? snapshot.uri : snapshot;
        const storedUrl = await storeImage(url);
        this.props.onDrawAreaFinish({ geostore }, storedUrl);
      })
      .catch((error) => console.warn(error));
  }

  setBoundaries = () => {
    if (!this.bboxed) {
      if (this.afterRenderTimer) {
        clearTimeout(this.afterRenderTimer);
      }
      this.afterRenderTimer = setTimeout(() => {
        this.bboxed = true;
        let boundaries = CONSTANTS.maps.bbox.coordinates[0];
        if (this.props.country && this.props.country.bbox) {
          boundaries = this.props.country.bbox.coordinates[0];
        }
        this.map.fitToCoordinates(getGoogleMapsCoordinates(boundaries), {
          edgePadding: { top: 0, right: 0, bottom: 0, left: 0 },
          animated: true
        });
      }, 1000);
    }
  }

  getLegend() {
    const finished = this.state.shape.coordinates.length >= 3;
    if (!finished) {
      const withPadding = this.state.shape.coordinates.length >= 1 ?
       styles.actionButtonWithPadding : null;

      return (
        <View style={[styles.actionButton, withPadding]}>
          <Text style={styles.footerTitle}>{I18n.t('setupDrawAreas.tapInstruction')}</Text>
        </View>
      );
    }

    let validArea = true;
    let btnText = null;
    if (!this.state.valid) {
      btnText = I18n.t('setupDrawAreas.invalidShape');
      validArea = false;
    } else if (this.state.huge) {
      btnText = I18n.t('setupDrawAreas.invalidSize');
      validArea = false;
    }

    return (validArea)
      ? <ActionButton
        style={[styles.actionButton, styles.actionButtonWithPadding]}
        onPress={this.onNextPress}
        text={I18n.t('commonText.next').toUpperCase()}
      />
      : <ActionButton
        style={[styles.actionButton, styles.actionButtonWithPadding]}
        disabled
        error
        onPress={this.clearShape}
        text={btnText.toUpperCase()}
      />;
  }

  clearShape = () => {
    this.setState({
      valid: true,
      shape: {
        coordinates: []
      }
    });
  }

  undoShape = () => {
    const { shape, valid } = this.state;
    let isValid = valid;
    shape.coordinates = shape.coordinates.filter((cord, index) => (
      index < shape.coordinates.length - 1
    ));

    if (shape.coordinates.length >= 3) {
      const intersects = gpsi({
        type: 'Feature',
        geometry: getGeoJson(shape.coordinates)
      });

      if ((intersects && intersects.geometry) &&
      intersects.geometry.coordinates.length > 0) {
        isValid = false;
      } else {
        isValid = true;
      }
    }

    this.setState({
      shape: {
        ...shape,
        coordinates: shape.coordinates
      },
      valid: isValid
    });
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
    const { valid, shape } = this.state;
    const { coordinates } = shape;
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
          onPress={e => this.onMapPress(e)}
          moveOnMarkerPress={false}
          onLayout={this.setBoundaries}
        >
          {coordinates.length > 0 && (
            <MapView.Polygon
              key={0}
              coordinates={coordinates}
              fillColor={valid ? Theme.polygon.fill : Theme.polygon.fillInvalid}
              strokeColor={Theme.polygon.strokeSelected}
              strokeWidth={coordinates.length >= 3 ? 2 : 0}
              zIndex={0}
            />
          )}
          {markers.length > 0 && !this.state.snapshot && (
            <MapView.Polyline
              key="line"
              coordinates={markers}
              strokeColor={Theme.polygon.strokeSelected}
              strokeWidth={2}
              zIndex={2}
            />
          )}
          {markers.length >= 0 && !this.state.snapshot &&
            markers.map((marker, index) => {
              // const image = this.state.valid ? markerImage : markerRedImage;
              const image = markerImage;

              return (
                <MapView.Marker.Animated key={index} coordinate={marker} anchor={{ x: 0.5, y: 0.5 }}>
                  <Image
                    style={{ width: 10, height: 10 }}
                    source={image}
                  />
                </MapView.Marker.Animated>
              );
            })
          }
        </MapView>
        <View style={styles.footer}>
          <Image
            style={styles.footerBg}
            source={footerBackgroundImage}
          />
          <View style={styles.footerButton}>
            {this.state.shape.coordinates.length >= 1 &&
              <TouchableHighlight
                style={styles.undoButton}
                activeOpacity={0.8}
                underlayColor={Theme.background.white}
                onPress={this.undoShape}
              >
                <Image
                  style={{ width: 21, height: 9 }}
                  source={undoImage}
                />
              </TouchableHighlight>
            }
            {this.getLegend()}
          </View>
        </View>
      </View>
    );
  }
}

DrawAreas.propTypes = {
  country: React.PropTypes.shape({
    iso: React.PropTypes.string.isRequired,
    bbox: React.PropTypes.object,
    centroid: React.PropTypes.object
  }).isRequired,
  onDrawAreaFinish: React.PropTypes.func.isRequired
};

export default DrawAreas;
