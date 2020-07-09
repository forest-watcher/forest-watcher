import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dimensions, View, Image, Text, TouchableHighlight } from 'react-native';

import { AREAS, MAP_LAYER_INDEXES, MAPS } from 'config/constants';
import kinks from '@turf/kinks';
import { lineString, point, polygon } from '@turf/helpers';

import ActionButton from 'components/common/action-button';
import Theme from 'config/theme';
import i18n from 'i18next';
import { trackScreenView } from 'helpers/analytics';
import styles, { mapboxStyles } from './styles';
import { coordsArrayToObject } from 'helpers/location';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { getPolygonBoundingBox } from 'helpers/map';

const geojsonArea = require('@mapbox/geojson-area');

const footerBackgroundImage = require('assets/map_bg_gradient.png');
const undoImage = require('assets/undo.png');

const windowSize = Dimensions.get('window');
const screenshotPadding = 100;

class DrawAreas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      valid: true,
      huge: false,
      loading: false,
      nextPress: false,
      mapCameraBounds: this.getCountryBoundingBox(),
      markerLocations: []
    };
  }

  componentDidMount() {
    trackScreenView('Draw Areas');
  }

  onRegionDidChange = async () => {
    if (this.state.nextPress) {
      const { markerLocations } = this.state;
      const uri = await this.map.takeSnap(true);
      const polygonLocations = [...markerLocations, markerLocations[0]];
      // this is not "correct" GeoJson, but it is what the backend accepts
      const geojson = { type: 'Polygon', coordinates: [polygonLocations] };
      this.setState({ loading: false });
      this.props.onDrawAreaFinish({ geojson }, uri);
      this.setState({ nextPress: false });
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
    const polygonPerimeter = lineString(polygonLocations);
    const intersectionsGeoJson = kinks(polygonPerimeter);
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
    if (markerLocations && markerLocations.length > 2) {
      this.setState({ nextPress: true });
      const polygonLocations = [...markerLocations, markerLocations[0]];
      const coordinates = polygonLocations.map(coordinate => coordsArrayToObject(coordinate));
      // We want to aim for a zoom level that has equal horizontal and vertical padding irrespective of the device's aspect ratio
      // Because the screenshot is taken from the whole screen we need to do some maths!
      const width = windowSize.width - screenshotPadding * 2;
      // Good job I did A-Level maths! Just solve for verticalPadding...
      const verticalPadding = (windowSize.height - width) / 2;
      const snapshotPadding = {
        paddingTop: verticalPadding,
        paddingBottom: verticalPadding,
        paddingLeft: screenshotPadding,
        paddingRight: screenshotPadding
      };
      const bounds = getPolygonBoundingBox(coordinates);
      const cameraConfig = {
        ...bounds,
        ...snapshotPadding
      };
      this.mapCamera.setCamera({ bounds: cameraConfig });
      this.setState({ loading: true });
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
      valid: true
    });
  };

  undoLastPoint = () => {
    this.updateMarkerLocations(this.state.markerLocations.slice(0, -1));
  };

  renderNewAreaOutline = coords => {
    if (!coords || coords.length === 0) {
      return null;
    }
    const outlineCoords = [...coords, coords[0]];
    const outlineShape = lineString(outlineCoords);

    let markersShape = null;
    if (coords.length > 1) {
      markersShape = lineString(coords);
    } else if (coords.length === 1) {
      markersShape = point(coords[0]);
    }
    return (
      <React.Fragment>
        <MapboxGL.ShapeSource id="newAreaMarkers" shape={markersShape}>
          <MapboxGL.CircleLayer
            id="newAreaMarkerOuter"
            style={mapboxStyles.pointOuterCircle}
            layerIndex={MAP_LAYER_INDEXES.areaOutline}
          />
          <MapboxGL.CircleLayer
            id="newAreaMarkerInner"
            style={mapboxStyles.pointInnerCircle}
            layerIndex={MAP_LAYER_INDEXES.areaOutline}
          />
        </MapboxGL.ShapeSource>
        {coords.length > 1 && (
          <MapboxGL.ShapeSource id="newAreaOutline" shape={outlineShape}>
            <MapboxGL.LineLayer
              id="outlineLineLayer"
              style={mapboxStyles.areaOutlineLayer}
              layerIndex={MAP_LAYER_INDEXES.areaOutline}
            />
          </MapboxGL.ShapeSource>
        )}
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
          <MapboxGL.FillLayer
            id="newAreaPolygonFill"
            style={mapboxStyles.areaFill}
            layerIndex={MAP_LAYER_INDEXES.areaOutline}
          />
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

    const { markerLocations, nextPress } = this.state;

    return (
      <View style={styles.container}>
        <MapboxGL.MapView
          ref={ref => {
            this.map = ref;
          }}
          style={styles.mapView}
          styleURL={this.props.basemap.url}
          onPress={this.onMapPress}
          onRegionDidChange={this.onRegionDidChange}
          scrollEnabled={!nextPress /* Disable map moving while taking area snapshot image */}
          zoomEnabled={!nextPress}
          rotateEnabled={!nextPress}
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
  basemap: PropTypes.object.isRequired,
  country: PropTypes.shape({
    iso: PropTypes.string.isRequired,
    bbox: PropTypes.object,
    centroid: PropTypes.object
  }).isRequired,
  onDrawAreaFinish: PropTypes.func.isRequired
};

export default DrawAreas;
