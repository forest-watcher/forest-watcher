import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Image, Text, TouchableHighlight } from 'react-native';

import { AREAS, MAPS } from 'config/constants';
import { storeImage } from 'helpers/fileManagement';
import kinks from '@turf/kinks';
import { polygon } from '@turf/helpers';

import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles, { mapboxStyles } from './styles';
import { coordsArrayToObject } from 'helpers/location';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { getPolygonBoundingBox } from 'helpers/map';

const geojsonArea = require('@mapbox/geojson-area');

const footerBackgroundImage = require('assets/map_bg_gradient.png');
const undoImage = require('assets/undo.png');

class DrawAreas extends Component {
  constructor(props) {
    super(props);
    this.nextPress = false;
    this.state = {
      valid: true,
      huge: false,
      loading: false,
      mapCameraBounds: this.getCountryBoundingBox(),
      markerLocations: []
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Draw Areas');
  }

  onRegionChangeComplete = async () => {
    if (this.nextPress) {
      // const { coordinates } = this.state.shape;
      const snapshot = await this.takeSnapshot();
      const url = snapshot.uri ? snapshot.uri : snapshot;
      const storedUrl = await storeImage(url);
      // const geojson = getGeoJson(coordinates);
      this.setState({ loading: false });
      this.props.onDrawAreaFinish(/*{ geojson }*/ null, storedUrl);
      this.nextPress = false;
    }
  };

  getCountryBoundingBox = () => {
    let coordinates = this.props.country?.bbox?.coordinates?.[0];
    if (!coordinates) {
      return undefined;
    }
    coordinates = coordinates.map(coordinate => coordsArrayToObject(coordinate));
    return { ...MAPS.smallPadding, ...getPolygonBoundingBox(coordinates) };
  };

  // returns true if path intersects itself
  isValidAreaPolygon = markerLocations => {
    const polygonLocations = [...markerLocations, markerLocations[0]];
    const lineString = MapboxGL.geoUtils.makeLineString(polygonLocations);
    const intersectionsGeoJson = kinks(lineString);
    const intersections = intersectionsGeoJson?.features?.length;
    return !intersections;
  };

  // returns true if area is larger than max size
  isHugeAreaPolygon = markerLocations => {
    const polygonLocations = [...markerLocations, markerLocations[0]];
    const polygon2 = polygon([polygonLocations]);
    const areaSize2 = geojsonArea.geometry(polygon2?.geometry);
    return areaSize2 > AREAS.maxSize;
  };

  updateMarkerLocations = markerLocations => {
    if (markerLocations.length < 3) {
      this.setState({
        markerLocations: markerLocations,
        huge: false
      });
      return;
    }
    const valid = this.isValidAreaPolygon(markerLocations);
    const huge = this.isHugeAreaPolygon(markerLocations);
    this.setState({
      markerLocations,
      valid,
      huge
    });
  };

  onMapPress = event => {
    const { geometry } = event;
    this.updateMarkerLocations([...this.state.markerLocations, geometry?.coordinates]);
  };

  onNextPress = () => {
    const { markerLocations } = this.state;
    if (markerLocations && markerLocations.length > 1) {
      this.setState({ loading: true });
      /*const snapshotPadding =
        Platform.OS === 'ios'
          ? { top: 280, right: 80, bottom: 360, left: 80 }
          : { top: 560, right: 160, bottom: 720, left: 160 };
      this.map.fitToCoordinates(markerLocations, {
        edgePadding: snapshotPadding,
        animated: true
      });*/
      this.nextPress = true;
      // const snapshot = await this.takeSnapshot();
      // const url = snapshot.uri ? snapshot.uri : snapshot;
      // const storedUrl = await storeImage(url);
      // const geojson = getGeoJson(coordinates);
      this.setState({ loading: false });
      this.props.onDrawAreaFinish(/*{ geojson }*/ null, null);
      this.nextPress = false;
    }
  };

  getLegend() {
    const finished = this.state.markerLocations.length >= 3;
    if (!finished) {
      const withPadding = this.state.markerLocations.length >= 1 ? styles.actionButtonWithPadding : null;

      return (
        <View pointerEvents="none" style={[styles.actionButton, withPadding]}>
          <Text style={styles.footerTitle}>{i18n.t('setupDrawAreas.tapInstruction')}</Text>
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

  undoLastPoint = () => {
    this.updateMarkerLocations(this.state.markerLocations.slice(0, -1));
  };

  takeSnapshot() {
    return this.map.takeSnapshot({
      format: 'jpg',
      quality: 0.8,
      result: 'file'
    });
  }

  renderNewAreaOutline = coords => {
    if (!coords || coords.length === 0) {
      return null;
    }
    let markersShape = null;
    if (coords.length > 1) {
      markersShape = MapboxGL.geoUtils.makeLineString(coords);
    } else if (coords.length === 1) {
      markersShape = MapboxGL.geoUtils.makePoint(coords[0]);
    }
    return (
      <React.Fragment>
        <MapboxGL.ShapeSource id="route" shape={markersShape}>
          <MapboxGL.CircleLayer id="routeCircleOuter" style={mapboxStyles.routeOuterCircle} />
          <MapboxGL.CircleLayer id="routeCircleInner" style={mapboxStyles.routeInnerCircle} />
          {coords.length > 1 && <MapboxGL.LineLayer id="outlineLineLayer" style={mapboxStyles.routeLineLayer} />}
        </MapboxGL.ShapeSource>
      </React.Fragment>
    );
  };

  renderPolygon = coords => {
    if (!this.state.valid || !coords || coords.length < 3) {
      return null;
    }
    coords = [...coords, coords[0]];
    const polygonShape = polygon([coords]);
    return (
      <React.Fragment>
        <MapboxGL.ShapeSource id="newAreaPolygon" shape={polygonShape}>
          <MapboxGL.FillLayer id="newAreaPolygonFill" style={mapboxStyles.areaFill} />
        </MapboxGL.ShapeSource>
      </React.Fragment>
    );
  };

  render() {
    // Controls view of map (location / zoom)
    const renderMapCamera = (
      <MapboxGL.Camera
        ref={ref => {
          this.mapCamera = ref;
        }}
        bounds={this.state.mapCameraBounds}
        animationDuration={0}
      />
    );

    const { markerLocations } = this.state;
    /*
    const { contextualLayer } = this.props;
    const ctxLayerKey =
      Platform.OS === 'ios' && contextualLayer
        ? `contextualLayerElement-${contextualLayer.name}`
        : 'contextualLayerElement';
    */

    return (
      <View style={styles.container}>
        <MapboxGL.MapView
          ref={ref => {
            this.map = ref;
          }}
          style={styles.mapView}
          styleURL={MapboxGL.StyleURL.SatelliteStreet}
          onPress={this.onMapPress}
        >
          {renderMapCamera}
          {this.renderNewAreaOutline(markerLocations)}
          {this.renderPolygon(markerLocations)}
        </MapboxGL.MapView>
        <View pointerEvents="box-none" style={styles.footer}>
          <Image style={styles.footerBg} source={footerBackgroundImage} />
          <View pointerEvents="box-none" style={styles.footerButton}>
            {markerLocations.length > 0 && (
              <TouchableHighlight
                style={styles.undoButton}
                activeOpacity={0.8}
                underlayColor={Theme.background.white}
                onPress={this.undoLastPoint}
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
  coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
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
