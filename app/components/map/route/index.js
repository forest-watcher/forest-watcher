// @flow

import type { Coordinates, MapboxFeaturePressEvent, RouteFeatureProperties } from 'types/common.types';
import type { LocationPoint, Route } from 'types/routes.types';

import React, { PureComponent } from 'react';
const emitter = require('tiny-emitter/instance');

import { mapboxStyles } from './styles';
import {
  coordsObjectToArray,
  getValidLocations,
  GFWOnLocationEvent,
  removeDuplicateLocations,
  type GFWLocationError
} from 'helpers/location';
import { isValidLatLng } from 'helpers/validation/location';
import throttle from 'lodash/throttle';
import MapboxGL from '@react-native-mapbox-gl/maps';
import { feature, lineString, point } from '@turf/helpers';
import { MAP_LAYER_INDEXES } from 'config/constants';

type Props = {
  isTracking: boolean,
  userLocation: ?LocationPoint,
  route: ?Route,
  selected?: ?boolean, // if route has been tapped on - emphasise ui
  onShapeSourcePressed?: (MapboxFeaturePressEvent<RouteFeatureProperties>) => void
};

type State = {
  currentRouteLocations: Array<LocationPoint>
};

export default class RouteMarkers extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentRouteLocations: []
    };

    // If we're tracking a route, fetch any of the route locations from the database and display them.
    // This means that any locations we received while in the background will be displayed.
    if (props.isTracking) {
      this.fetchRouteLocations();
    }
  }

  componentDidMount() {
    emitter.on(GFWOnLocationEvent, this.updateLocationFromGeolocation);
  }

  componentWillUnmount() {
    emitter.off(GFWOnLocationEvent, this.updateLocationFromGeolocation);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.isTracking && !this.props.isTracking) {
      this.setState({
        currentRouteLocations: []
      });
    } else if (!prevProps.isTracking && this.props.isTracking) {
      this.fetchRouteLocations();
    }
  }

  fetchRouteLocations = () => {
    getValidLocations((locations, error: ?GFWLocationError) => {
      if (error) {
        console.warn('3SC', 'route', `fetchRouteLocations returned an error ${error}`);
        return;
      }

      if (locations) {
        this.setState({
          currentRouteLocations: locations
        });
      }
    });
  };

  /**
   * reconcileRouteLocations - Given two arrays of locations, determines which should be used.
   * This allows the UI to show locations for a current or previous route without needing to know what it's displaying.
   *
   * @param  {array<LocationPoint>} currentRouteLocations  Locations for a current route, if the user is tracking a route.
   * @param  {array<LocationPoint>} previousRouteLocations Locations for a previous route, if the user is viewing a saved route.
   */
  reconcileRouteLocations = (
    currentRouteLocations: Array<LocationPoint>,
    previousRouteLocations: ?Array<LocationPoint>
  ): ?Array<LocationPoint> => {
    if (currentRouteLocations.length > 0) {
      return currentRouteLocations;
    } else if (previousRouteLocations && previousRouteLocations?.length > 0) {
      return previousRouteLocations;
    } else {
      return null;
    }
  };

  /**
   * updateLocationFromGeolocation - Handles any location updates that arrive while the user is on this screen.
   */
  updateLocationFromGeolocation = throttle((location: LocationPoint) => {
    this.setState(prevState => ({
      currentRouteLocations: this.props.isTracking
        ? [...(prevState.currentRouteLocations ?? []), location]
        : prevState.currentRouteLocations
    }));
  }, 300);

  /**
   * reconcileUserLocation - Given the user's last location fix, and the route locations, determines the user's last known location.
   * This is as, when route tracking, we need to show the line immediately so we cannot wait for the first location update.
   * However, when we're not route tracking, we won't have a last position to refer to!
   *
   * @param userLocation    - The last position update, passed into this object as a prop.
   * @param routeLocations  - The locations provided for this route.
   */
  reconcileUserLocation = (userLocation: ?LocationPoint, routeLocations: ?Array<LocationPoint>): ?LocationPoint => {
    if (userLocation) {
      return userLocation;
    } else if (routeLocations && routeLocations.length > 0) {
      return routeLocations[routeLocations.length - 1];
    } else {
      return null;
    }
  };

  // It seems mapbox is ridiculously picky with unique key/id names, when displaying multiple routes on the map
  key = (keyName: string) => {
    return keyName + (this.props.route?.id || 'route_in_progress' + (this.props.route?.startDate ?? ''));
  };

  // Draw line from user location to destination
  renderDestinationLine = (destination: ?Coordinates, userLocation: ?LocationPoint) => {
    if (!destination || !userLocation) {
      return null;
    }
    const validDestLocation = isValidLatLng(destination);
    const bothValidLocations = validDestLocation && isValidLatLng(userLocation);

    const routeDestination = point(coordsObjectToArray(destination));
    let line = null;
    if (bothValidLocations) {
      line = lineString([coordsObjectToArray(userLocation), coordsObjectToArray(destination)]);
    }

    return (
      <React.Fragment>
        {bothValidLocations && (
          <MapboxGL.ShapeSource id={this.key('routeDestLine')} shape={line}>
            <MapboxGL.LineLayer
              id={this.key('routeDestLineLayer')}
              style={mapboxStyles.destinationLine}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
          </MapboxGL.ShapeSource>
        )}
        {validDestLocation && (
          <MapboxGL.ShapeSource id={this.key('routeDest')} shape={routeDestination}>
            <MapboxGL.SymbolLayer
              id={this.key('routeDestMarker')}
              style={mapboxStyles.routeDestinationMarker}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
          </MapboxGL.ShapeSource>
        )}
      </React.Fragment>
    );
  };

  getRouteProperties = (): ?RouteFeatureProperties => {
    if (this.props.route) {
      // This will be false before the route has been saved
      const { name, endDate, id } = this.props.route;
      return { name, date: endDate, type: 'route', featureId: id };
    }
    return null;
  };

  renderRoutePath = (routeLocations: Array<LocationPoint>) => {
    const coords = routeLocations.map(coord => coordsObjectToArray(coord));
    const routeProps = this.getRouteProperties();
    if (!coords || coords.length < 2 || !routeProps) {
      return null;
    }

    const line = lineString(coords, routeProps);
    // Ignore first and last location markers, as those are drawn in renderRouteEnds method.
    const markers = coords.slice(1, -1);
    let markersShape = null;
    if (markers.length > 1) {
      markersShape = feature({ type: 'MultiPoint', coordinates: markers });
    } else if (markers.length === 1) {
      markersShape = feature({ type: 'Point', coordinates: markers[0] });
    }
    const { selected } = this.props;
    const visibility = selected ? mapboxStyles.visible : mapboxStyles.invisible;
    const shadowStyle = { ...mapboxStyles.routeLineShadow, ...visibility };
    const routeLineStyle = {
      ...mapboxStyles.routeLineLayer,
      ...(selected ? mapboxStyles.routeLineLayerSelected : {})
    };

    const onPress = this.props.onShapeSourcePressed || null;
    return (
      <React.Fragment>
        <MapboxGL.ShapeSource onPress={onPress} id={this.key('routeLine')} shape={line}>
          <MapboxGL.LineLayer
            id={this.key('routeLineShadow')}
            style={shadowStyle}
            layerIndex={MAP_LAYER_INDEXES.routes}
          />
          <MapboxGL.LineLayer
            id={this.key('routeLineLayer')}
            style={routeLineStyle}
            layerIndex={MAP_LAYER_INDEXES.routes}
          />
        </MapboxGL.ShapeSource>
        {/* Mapbox doesnt like to use the same ShapeSource with different shape types supplied*/}
        {markers.length === 1 && (
          <MapboxGL.ShapeSource id={this.key('routeMarker')} shape={markersShape}>
            <MapboxGL.CircleLayer
              key={this.key('routeCircleOuter')}
              id={this.key('routeCircleOuter')}
              style={mapboxStyles.routeOuterCircle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
            <MapboxGL.CircleLayer
              key={this.key('routeCircleInner')}
              id={this.key('routeCircleInner')}
              style={mapboxStyles.routeInnerCircle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
          </MapboxGL.ShapeSource>
        )}
        {markers.length > 1 && (
          <MapboxGL.ShapeSource id={this.key('routeMarkers')} shape={markersShape}>
            <MapboxGL.CircleLayer
              key={this.key('routeCircleOuter')}
              id={this.key('routeCircleOuter')}
              style={mapboxStyles.routeOuterCircle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
            <MapboxGL.CircleLayer
              key={this.key('routeCircleInner')}
              id={this.key('routeCircleInner')}
              style={mapboxStyles.routeInnerCircle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
          </MapboxGL.ShapeSource>
        )}
      </React.Fragment>
    );
  };

  renderRouteEnds = (routeLocations: Array<LocationPoint>) => {
    const count = routeLocations?.length;
    const start = count > 0 ? routeLocations[0] : null;
    const end = count > 1 ? routeLocations[count - 1] : null;
    const properties = this.getRouteProperties();
    const startSource = start ? point(coordsObjectToArray(start), properties) : null;
    const endSource = end ? point(coordsObjectToArray(end), properties) : null;
    const onPress = this.props.onShapeSourcePressed || null;
    const visibility = this.props.selected ? mapboxStyles.visible : mapboxStyles.invisible;
    const shadowStyle = { ...mapboxStyles.routeEndsShadow, ...visibility };
    const routeEndsInnerStyle = this.props.selected ? mapboxStyles.routeEndsInnerSelected : mapboxStyles.routeEndsInner;
    const routeEndsOuterStyle = this.props.selected ? mapboxStyles.routeEndsOuterSelected : mapboxStyles.routeEndsOuter;
    return (
      <React.Fragment>
        {start && (
          <MapboxGL.ShapeSource onPress={onPress} id={this.key('routeStart')} shape={startSource}>
            <MapboxGL.CircleLayer
              key={this.key('routeStartShadow')}
              id={this.key('routeStartShadow')}
              style={shadowStyle}
              belowLayerID={this.key('routeLineShadow')}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
            <MapboxGL.CircleLayer
              key={this.key('routeStartOuter')}
              id={this.key('routeStartOuter')}
              style={routeEndsOuterStyle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
            <MapboxGL.CircleLayer
              key={this.key('routeStartInner')}
              id={this.key('routeStartInner')}
              style={routeEndsInnerStyle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
          </MapboxGL.ShapeSource>
        )}
        {end && (
          <MapboxGL.ShapeSource onPress={onPress} id={this.key('routeEnd')} shape={endSource}>
            <MapboxGL.CircleLayer
              key={this.key('routeEndShadow')}
              id={this.key('routeEndShadow')}
              style={shadowStyle}
              belowLayerID={this.key('routeLineShadow')}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
            <MapboxGL.CircleLayer
              key={this.key('routeEndOuter')}
              id={this.key('routeEndOuter')}
              style={routeEndsOuterStyle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
            <MapboxGL.CircleLayer
              key={this.key('routeEndInner')}
              id={this.key('routeEndInner')}
              style={routeEndsInnerStyle}
              layerIndex={MAP_LAYER_INDEXES.routes}
            />
          </MapboxGL.ShapeSource>
        )}
      </React.Fragment>
    );
  };

  render() {
    let routeLocations = this.reconcileRouteLocations(this.state.currentRouteLocations, this.props.route?.locations);
    routeLocations = removeDuplicateLocations(routeLocations);
    const userLocation = this.reconcileUserLocation(this.props.userLocation, routeLocations);
    if (!routeLocations || !this.props.route?.startDate) {
      return null;
    }
    return (
      <React.Fragment>
        {this.renderRoutePath(routeLocations)}
        {this.renderRouteEnds(routeLocations)}
        {this.props.isTracking && this.renderDestinationLine(this.props.route?.destination, userLocation)}
      </React.Fragment>
    );
  }
}
