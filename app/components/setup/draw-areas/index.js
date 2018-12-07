import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, Text, Dimensions, TouchableHighlight, Platform } from 'react-native';

import { MAPS, AREAS } from 'config/constants';
import MapView from 'react-native-maps';
import gpsi from 'geojson-polygon-self-intersections';
import { storeImage } from 'helpers/fileManagement';

import ActionButton from 'components/common/action-button';
import MapAttribution from 'components/map/map-attribution';
import Theme from 'config/theme';
import i18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const geojsonArea = require('@mapbox/geojson-area');

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 15;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const edgePadding = { top: 180, right: 85, bottom: 180, left: 85 };

const footerBackgroundImage = require('assets/map_bg_gradient.png');
const markerImage = require('assets/circle.png');
const markerRedImage = require('assets/circle_red.png');
const undoImage = require('assets/undo.png');

function parseCoordinates(coordinates) {
  return coordinates.map(cordinate => ({
    key: cordinate.key,
    latitude: cordinate.latitude,
    longitude: cordinate.longitude
  }));
}

function getGoogleMapsCoordinates(coordinates) {
  if (!coordinates) return [];
  return coordinates.map(cordinate => ({
    latitude: cordinate[1],
    longitude: cordinate[0]
  }));
}

function getGeoJson(coordinates) {
  const firstGeo = [coordinates[0].longitude, coordinates[0].latitude];
  const geoCordinates = coordinates.map(item => [item.longitude, item.latitude]);
  geoCordinates.push(firstGeo);
  return {
    type: 'Polygon',
    coordinates: [geoCordinates]
  };
}

class DrawAreas extends Component {
  constructor(props) {
    super(props);
    //const intialCoords = this.props.country && this.props.country.centroid ? this.props.country.centroid.coordinates : [MAPS.lng, MAPS.lat];

    this.nextPress = false;
    this.mapReady = false;
    this.state = {
      valid: true,
      huge: false,
      loading: false,
      shape: {
        coordinates: getGoogleMapsCoordinates(props.coordinates)
      },
      /*region: {
        latitude: intialCoords[1],
        longitude: intialCoords[0],
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }*/
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Draw Areas');
  }

  onMapReady = () => {
    this.mapReady = true;
  };

  onRegionChangeComplete = async () => {
    if (this.nextPress) {
      const { coordinates } = this.state.shape;
      const snapshot = await this.takeSnapshot();
      const url = snapshot.uri ? snapshot.uri : snapshot;
      const storedUrl = await storeImage(url);
      const geojson = getGeoJson(coordinates);
      this.setState({ loading: false });
      this.props.onDrawAreaFinish({ geojson }, storedUrl);
      this.nextPress = false;
    }
  };

  onMapPress = e => {
    const { coordinate } = e.nativeEvent;
    if (this.mapReady && coordinate) {
      const { shape, valid } = this.state;
      const coords = [
        ...shape.coordinates,
        {
          ...coordinate,
          key: `${coordinate.latitude}-${coordinate.longitude}`
        }
      ];
      const geo = getGeoJson(coords);
      let isValid = valid;
      let isHuge = false;

      if (coords.length >= 3) {
        const intersects = gpsi({
          type: 'Feature',
          geometry: geo
        });

        if (intersects && intersects.geometry && intersects.geometry.coordinates.length > 0) {
          isValid = false;
        }
        const area = geojsonArea.geometry(geo);
        if (area > AREAS.maxSize) {
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
  };

  onNextPress = async () => {
    const { coordinates } = this.state.shape;
    if (coordinates && coordinates.length > 1) {
      this.setState({ loading: true });
      const snapshotPadding =
        Platform.OS === 'ios' ? { top: 280, right: 80, bottom: 360, left: 80 } : { top: 560, right: 160, bottom: 720, left: 160 };
      this.map.fitToCoordinates(coordinates, {
        edgePadding: snapshotPadding,
        animated: true
      });
      this.nextPress = true;
    }
  };

  onLayout = () => {
    let boundaries = getGoogleMapsCoordinates(MAPS.bbox.coordinates[0]);
    const { coordinates } = this.state.shape;
    if (coordinates && coordinates.length > 1) {
      boundaries = coordinates;
    } else if (this.props.country && this.props.country.bbox) {
      boundaries = getGoogleMapsCoordinates(this.props.country.bbox.coordinates[0]);
    }

    this.map.fitToCoordinates(boundaries, {
      edgePadding,
      animated: true
    });
  };

  getLegend() {
    const finished = this.state.shape.coordinates.length >= 3;
    if (!finished) {
      const withPadding = this.state.shape.coordinates.length >= 1 ? styles.actionButtonWithPadding : null;

      return (
        <View pointerEvents="none" style={[styles.actionButton, withPadding]}>
          <Text style={styles.footerTitle}>{i18n.t('setupDrawAreas.tapInstruction')}</Text>
          <MapAttribution />
        </View>
      );
    }

    let validArea = true;
    let btnText = null;
    if (!this.state.valid) {
      btnText = i18n.t('setupDrawAreas.invalidShape');
      validArea = false;
    } else if (this.state.huge) {
      btnText = i18n.t('setupDrawAreas.invalidSize');
      validArea = false;
    }

    return validArea ? (
      <ActionButton
        style={[styles.actionButton, styles.actionButtonWithPadding]}
        disabled={this.state.loading}
        onPress={this.onNextPress}
        text={i18n.t('commonText.next').toUpperCase()}
      />
    ) : (
      <ActionButton
        style={[styles.actionButton, styles.actionButtonWithPadding]}
        disabled
        error
        onPress={this.clearShape}
        text={btnText.toUpperCase()}
      />
    );
  }

  clearShape = () => {
    this.setState({
      valid: true,
      shape: {
        coordinates: []
      }
    });
  };

  undoShape = () => {
    const { shape, valid } = this.state;
    let isValid = valid;
    let isHuge = false;
    const coordinates = shape.coordinates.slice(0, -1);

    if (coordinates.length >= 3) {
      const intersects = gpsi({
        type: 'Feature',
        geometry: getGeoJson(coordinates)
      });

      isValid = intersects && intersects.geometry && intersects.geometry.coordinates.length === 0;
      const area = geojsonArea.geometry(getGeoJson(coordinates));
      if (area > AREAS.maxSize) {
        isHuge = true;
      }
    }

    this.setState({
      shape: {
        ...shape,
        coordinates
      },
      valid: isValid,
      huge: isHuge
    });
  };

  takeSnapshot() {
    return this.map.takeSnapshot({
      format: 'jpg',
      quality: 0.8,
      result: 'file'
    });
  }

  render() {
    const { valid, shape } = this.state;
    const { contextualLayer } = this.props;
    const { coordinates } = shape;
    const markers = parseCoordinates(coordinates);
    const ctxLayerKey =
      Platform.OS === 'ios' && contextualLayer ? `contextualLayerElement-${contextualLayer.name}` : 'contextualLayerElement';

    return (
      <View style={styles.container}>
        <MapView
          ref={ref => {
            this.map = ref;
          }}
          style={styles.map}
          provider={MapView.PROVIDER_GOOGLE}
          mapType="none"
          rotateEnabled={false}
          onMapReady={this.onMapReady}
          onRegionChangeComplete={this.onRegionChangeComplete}
          onPress={this.onMapPress}
          moveOnMarkerPress={false}
          onLayout={this.onLayout}
        >
          <MapView.UrlTile key="basemapLayerElement" urlTemplate={MAPS.basemap} zIndex={-1} />
          {contextualLayer && <MapView.UrlTile key={ctxLayerKey} urlTemplate={contextualLayer.url} zIndex={1} />}
          {coordinates.length > 0 && (
            <MapView.Polygon
              key={coordinates.length}
              coordinates={coordinates}
              fillColor={valid ? Theme.polygon.fill : Theme.polygon.fillInvalid}
              strokeColor={Theme.polygon.strokeSelected}
              strokeWidth={coordinates.length >= 3 ? 2 : 0}
              zIndex={0}
            />
          )}
          {markers.length > 0 && coordinates.length > 1 && (
            <MapView.Polyline key={'line'} coordinates={markers} strokeColor={Theme.polygon.strokeSelected} strokeWidth={2} zIndex={2} />
          )}
          {markers.length >= 0 &&
            markers.map(marker => {
              const image = valid ? markerImage : markerRedImage;
              return (
                <MapView.Marker.Animated key={marker.key + valid} coordinate={marker} anchor={{ x: 0.5, y: 0.5 }}>
                  <Image style={{ width: 10, height: 10 }} source={image} />
                </MapView.Marker.Animated>
              );
            })}
        </MapView>
        <View pointerEvents="box-none" style={styles.footer}>
          <Image style={styles.footerBg} source={footerBackgroundImage} />
          <View pointerEvents="box-none" style={styles.footerButton}>
            {shape.coordinates.length >= 1 && (
              <TouchableHighlight
                style={styles.undoButton}
                activeOpacity={0.8}
                underlayColor={Theme.background.white}
                onPress={this.undoShape}
              >
                <Image style={{ width: 21, height: 9 }} source={undoImage} />
              </TouchableHighlight>
            )}
            {this.getLegend()}
          </View>
        </View>
      </View>
    );
  }
}

DrawAreas.propTypes = {
  country: PropTypes.shape({
    iso: PropTypes.string.isRequired,
    bbox: PropTypes.object,
    centroid: PropTypes.object
  }).isRequired,
  onDrawAreaFinish: PropTypes.func.isRequired,
  contextualLayer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string.isRequired
  })
};

export default DrawAreas;
