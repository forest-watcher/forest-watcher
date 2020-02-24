// @flow

import React, { PureComponent } from 'react';
import MapView from 'react-native-maps';
import { View } from 'react-native';
var emitter = require('tiny-emitter/instance');

import styles from '../styles';
import Theme from '../../../config/theme';
import { getValidLocations, GFWOnLocationEvent } from 'helpers/location';
import throttle from 'lodash/throttle';

type Props = {
  isTracking: boolean,
  lastPosition: Location,
  route: Route
};

const markerImage = require('assets/marker.png');

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
      // eslint-disable-next-line react/no-did-update-set-state
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
   * reconcileLastPosition - Given the user's last location fix, and the route locations, determines the user's last known location.
   * This is as, when route tracking, we need to show the line immediately so we cannot wait for the first location update.
   * However, when we're not route tracking, we won't have a last position to refer to!
   *
   * @param lastPosition    - The last position update, passed into this object as a prop.
   * @param routeLocations  - The locations provided for this route.
   */
  reconcileLastPosition = (lastPosition, routeLocations) => {
    if (lastPosition) {
      return lastPosition;
    } else if (routeLocations && routeLocations.length > 0) {
      return routeLocations[routeLocations.length - 1];
    } else {
      return null;
    }
  };

  render() {
    const routeLocations = this.reconcileRouteLocations(this.state.currentRouteLocations, this.props.route?.locations);
    const lastPosition = this.reconcileLastPosition(this.props.lastPosition, routeLocations);

    return (
      <React.Fragment>
        {routeLocations ? (
          <MapView.Marker
            key="currentRouteStartElement"
            image={markerImage}
            coordinate={routeLocations[0]}
            style={{ zIndex: 4 }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          />
        ) : null}
        {routeLocations ? (
          <MapView.Polyline
            key="currentRouteLineElements"
            coordinates={routeLocations}
            strokeColor={Theme.colors.white}
            strokeWidth={3}
            zIndex={3}
          />
        ) : null}
        {routeLocations
          ? routeLocations.map(location => (
              <MapView.Marker
                key={`currentRouteCorner-${location.timestamp}`}
                coordinate={location}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={3}
                tracksViewChanges={false}
              >
                <View style={styles.routeVertex} />
              </MapView.Marker>
            ))
          : null}
        {this.props.route?.destination ? (
          <MapView.Marker
            key={'routeDestination'}
            coordinate={this.props.route?.destination}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={20}
            tracksViewChanges={false}
          >
            <View style={[{ height: 18, width: 18, borderWidth: 3 }, styles.selectedMarkerIcon]} />
          </MapView.Marker>
        ) : null}
        {this.props.isTracking && lastPosition && this.props.route?.destination ? (
          <MapView.Polyline
            key="destinationLineElement"
            coordinates={[lastPosition, this.props.route?.destination]}
            strokeColor={Theme.colors.lightBlue}
            strokeWidth={3}
            zIndex={3}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
