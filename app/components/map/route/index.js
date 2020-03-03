// @flow

import React, { PureComponent } from 'react';
const emitter = require('tiny-emitter/instance');

import { mapboxStyles } from './styles';
import { coordsObjectToArray, getValidLocations, GFWOnLocationEvent, isValidLatLng } from 'helpers/location';
import throttle from 'lodash/throttle';
import MapboxGL from '@react-native-mapbox-gl/maps';
import type { Route } from 'types/routes.types';

type Props = {
  isTracking: boolean,
  userLocation: Location,
  route: Route
};

export default class RouteMarkers extends PureComponent<Props> {
  constructor(props) {
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

  componentDidUpdate(prevProps) {
    if (prevProps.isTracking && !this.props.isTracking) {
      this.setState({
        currentRouteLocations: []
      });
    } else if (!prevProps.isTracking && this.props.isTracking) {
      this.fetchRouteLocations();
    }
  }

  fetchRouteLocations = () => {
    getValidLocations((locations, error) => {
      if (error) {
        // todo: handle error
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
   * @param  {array<Location>} currentRouteLocations  Locations for a current route, if the user is tracking a route.
   * @param  {array<Location>} previousRouteLocations Locations for a previous route, if the user is viewing a saved route.
   */
  reconcileRouteLocations = (currentRouteLocations, previousRouteLocations) => {
    if (currentRouteLocations && currentRouteLocations?.length > 0) {
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
  updateLocationFromGeolocation = throttle(location => {
    this.setState(prevState => ({
      currentRouteLocations: this.props.isTracking
        ? [...prevState.currentRouteLocations, location]
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
  reconcileUserLocation = (userLocation, routeLocations) => {
    if (userLocation) {
      return userLocation;
    } else if (routeLocations && routeLocations.length > 0) {
      return routeLocations[routeLocations.length - 1];
    } else {
      return null;
    }
  };

  // Draw line from user location to destination
  renderDestinationLine = (destination, userLocation) => {
    if (!destination || !userLocation) {
      return null;
    }
    const validDestLocation = isValidLatLng(destination);
    const bothValidLocations = validDestLocation && isValidLatLng(userLocation);

    const routeDestination = MapboxGL.geoUtils.makePoint(coordsObjectToArray(destination));
    let line = null;
    if (bothValidLocations) {
      line = MapboxGL.geoUtils.makeLineString([coordsObjectToArray(userLocation), coordsObjectToArray(destination)]);
    }

    return (
      <React.Fragment>
        {bothValidLocations && (
          <MapboxGL.ShapeSource id="routeDestLine" shape={line}>
            <MapboxGL.LineLayer id="routeDestLineLayer" style={mapboxStyles.destinationLine} />
          </MapboxGL.ShapeSource>
        )}
        {validDestLocation && (
          <MapboxGL.ShapeSource id="routeDest" shape={routeDestination}>
            <MapboxGL.SymbolLayer id="routeDestMarker" style={mapboxStyles.routeDestinationMarker} />
          </MapboxGL.ShapeSource>
        )}
      </React.Fragment>
    );
  };

  renderRoutePath = routeLocations => {
    const coords = routeLocations?.map(coord => coordsObjectToArray(coord));
    // Ignore first and last location markers, as those are drawn in renderRouteEnds method.
    if (!coords || coords.length < 2) {
      return null;
    }
    const line = MapboxGL.geoUtils.makeLineString(coords);
    return (
      <React.Fragment>
        <MapboxGL.ShapeSource id="route" shape={line}>
          <MapboxGL.LineLayer id="routeLineLayer" style={mapboxStyles.routeLineLayer} />
        </MapboxGL.ShapeSource>
        <MapboxGL.ShapeSource id="route" shape={line}>
          <MapboxGL.CircleLayer key="routeCircleOuter" id="routeCircleOuter" style={mapboxStyles.routeOuterCircle} />
          <MapboxGL.CircleLayer key="routeCircleInner" id="routeCircleInner" style={mapboxStyles.routeInnerCircle} />
        </MapboxGL.ShapeSource>
      </React.Fragment>
    );
  };

  renderRouteEnds = routeLocations => {
    const count = routeLocations?.length;
    const start = count > 0 ? routeLocations[0] : null;
    const end = count > 1 ? routeLocations[count - 1] : null;
    const startSource = start ? MapboxGL.geoUtils.makePoint(coordsObjectToArray(start)) : null;
    const endSource = start ? MapboxGL.geoUtils.makePoint(coordsObjectToArray(end)) : null;
    return (
      <React.Fragment>
        {start && (
          <MapboxGL.ShapeSource id="routeStart" shape={startSource}>
            <MapboxGL.CircleLayer key="routeStartInner" id="routeStartOuter" style={mapboxStyles.routeStartOuter} />
            <MapboxGL.CircleLayer key="routeStartOuter" id="routeStartInner" style={mapboxStyles.routeStartInner} />
          </MapboxGL.ShapeSource>
        )}
        {end && (
          <MapboxGL.ShapeSource id="routeEnd" shape={endSource}>
            <MapboxGL.CircleLayer key="routeEndOuter" id="routeEndOuter" style={mapboxStyles.routeEndOuter} />
            <MapboxGL.CircleLayer key="routeEndInner" id="routeEndInner" style={mapboxStyles.routeEndInner} />
          </MapboxGL.ShapeSource>
        )}
      </React.Fragment>
    );
  };

  render() {
    const routeLocations = this.reconcileRouteLocations(this.state.currentRouteLocations, this.props.route?.locations);
    const userLocation = this.reconcileUserLocation(this.props.userLocation, routeLocations);

    return (
      <React.Fragment>
        {this.renderRoutePath(routeLocations)}
        {this.renderRouteEnds(routeLocations)}
        {this.props.isTracking && this.renderDestinationLine(this.props.route?.destination, userLocation)}
      </React.Fragment>
    );
  }
}
