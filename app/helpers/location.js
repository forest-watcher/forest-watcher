// @flow

import type { Location, ServiceStatus } from '@mauron85/react-native-background-geolocation';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';

import type { Coordinates, CoordinatesFormat } from 'types/common.types';
import type { LocationPoint, Route } from 'types/routes.types';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import * as Sentry from '@sentry/react-native';

const emitter = require('tiny-emitter/instance');

import { LOCATION_TRACKING } from 'config/constants';
import FWError from 'helpers/fwError';
import { formatCoordsByFormat, formatDistance, getDistanceOfLine } from 'helpers/map';
import i18n from 'i18next';
import _ from 'lodash';

export const GFWLocationAuthorizedAlways = BackgroundGeolocation.AUTHORIZED;
export const GFWLocationAuthorizedInUse = BackgroundGeolocation.AUTHORIZED_FOREGROUND;
export const GFWLocationUnauthorized = BackgroundGeolocation.NOT_AUTHORIZED;
export const GFWLocationUndetermined = 99; // This is a fixed constant within BackgroundGeolocation, but not exposed to JS!
export const GFWOnLocationEvent = 'gfw_onlocation_event';
export const GFWOnStationaryEvent = 'gfw_onstationary_event';
export const GFWOnHeadingEvent = 'gfw_onheading_event';
export const GFWOnErrorEvent = 'gfw_onerror_event';

// These error codes can be found in an enum in /node_modules/@mauron85/react-native-background-geolocation/ios/common/BackgroundGeolocation/MAURProviderDelegate.h
export const GFWErrorPermission = 1000;
export const GFWErrorLocation = 1003;
export const GFWErrorLocationStale = 10000; // This is our own custom error

/**
 * Cache the most recent received location so that we can instantly send a fix to new subscribers
 */
let mostRecentLocation = null;

/**
 * Initialises BackgroundGeolocation with sensible defaults for the usage of GFW tracking
 *
 * @return {Promise}
 */
export async function initialiseLocationFramework(): Promise<void> {
  return await configureLocationFramework({
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    ...LOCATION_TRACKING
  });
}

/**
 * Wrapper function around BackgroundGeolocation.configure that turns it from callback-based to promise-based
 *
 * @return {Promise}
 */
async function configureLocationFramework(configuration): Promise<void> {
  return await new Promise((resolve, reject) => {
    BackgroundGeolocation.configure(configuration, resolve, resolve);
  });
}

/**
 * Wrapper function around BackgroundGeolocation.getConfig that turns it from callback-based to promise-based
 *
 * @return {Promise}
 */
async function getConfiguration(): Promise<void> {
  return await new Promise((resolve, reject) => {
    BackgroundGeolocation.getConfig(resolve, reject);
  });
}

/**
 * Wrapper function that just called the same method in BackgroundGeolocation
 */
export function showLocationSettings() {
  if (Platform.OS === 'android') {
    BackgroundGeolocation.showLocationSettings();
  }
}

/**
 * Wrapper function that just called the same method in BackgroundGeolocation
 */
export function showAppSettings() {
  if (Platform.OS === 'android') {
    BackgroundGeolocation.showAppSettings();
  } else if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  }
}

/**
 * Wrapper function around BackgroundGeolocation.checkLocationStatus that turns it from callback-based to promise-based
 *
 * @return {Promise}
 */
export async function checkLocationStatus(): Promise<ServiceStatus> {
  return await new Promise((resolve, reject) => {
    BackgroundGeolocation.checkStatus(
      (isRunning, locationServicesEnabled, authorizationStatus) => {
        resolve(isRunning, locationServicesEnabled, authorizationStatus);
      },
      err => {
        resolve(false, false, GFWLocationUnauthorized);
      }
    );
  });
}

/**
 * requestAndroidLocationPermissions - When called, requests Android location permissions from the user.
 *
 * @param {function}  grantedCallback A callback that'll be executed if the user gives permission for us to access their location.
 */
async function requestAndroidLocationPermissions(): Promise<boolean> {
  const permissionResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return permissionResult === true || permissionResult === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Wrapper function around BackgroundGeolocation.getCurrentLocation that turns it from callback-based to promise-based
 */
export async function getCurrentLocation(): Promise<Location> {
  const result = await checkLocationStatus();

  if (!result.locationServicesEnabled) {
    throw new FWError({ code: GFWErrorLocation, message: 'Location disabled' });
  }

  if (result.authorization === GFWLocationUnauthorized) {
    const isResolved = Platform.OS === 'android' && (await requestAndroidLocationPermissions());
    // If location services are disabled and the authorization is explicitally denied, return an error.
    if (!isResolved) {
      throw new FWError({ code: GFWErrorPermission, message: 'Permissions denied' });
    }
  }

  return new Promise((resolve, reject) => {
    // We've got authorization (or the user hasn't been asked yet) 🎉. Try and find the current location...
    BackgroundGeolocation.getCurrentLocation(
      location => {
        mostRecentLocation = location;
        resolve(location);
      },
      (code, message) => {
        reject(new FWError({ code, message }));
      },
      {
        timeout: 10000, // ten seconds
        maximumAge: 1000 * 60 * 60, // one hour
        enableHighAccuracy: false
      }
    );
  });
}

/**
 * getValidLocations - When called, attempts to find all of the valid locations within the BackgroundGeolocation database.
 * This searches specifically for valid locations, as invalid ones are 'deleted' and should not be used.
 *
 * @param  {function}             completion A callback that'll be executed when the locations have been found.
 * @param  {array<LocationPoint>} completion.locations An array of location placemarks, that were retrieved from the database.
 * @param  {object}               completion.error An error that occurred while attempting to fetch locations.
 */
export function getValidLocations(completion: (?Array<Location>, ?Error) => void) {
  BackgroundGeolocation.getValidLocations(
    locations => {
      const mappedLocations = locations.map(location => {
        return createCompactedLocation(location);
      });
      completion(mappedLocations, null);
    },
    error => {
      completion(null, error);
    }
  );
}

/**
 * createCompactedLocation - Returns a location object, with unneeded details (such as bearing, provider etc) removed.
 *
 * @param  {object} location A location object, returned from BackgroundGeolocation.
 * @return {LocationPoint}   A LocationPoint object generated from the given location
 */
function createCompactedLocation(location: Location): LocationPoint {
  return {
    accuracy: location.accuracy,
    altitude: location.altitude,
    latitude: location.latitude,
    longitude: location.longitude,
    timestamp: location.time
  };
}

/**
 * Wrapper function around BackgroundGeolocation.deleteAllLocations that turns it from callback-based to promise-based
 */
export async function deleteAllLocations(): Promise<void> {
  return await new Promise((resolve, reject) => {
    BackgroundGeolocation.deleteAllLocations(resolve, reject);
  });
}

/**
 * startTrackingLocation - When called, attempts to start observing location updates.
 * If we don't have permission, we need to show an error.
 * If we have permission, we can register our listeners and start... listening...
 *
 * @param  {number}   requiredPermission   The required permission that we need.
 *    For example, while listening on the map screen we only need while in use, but while route tracking we need always.
 * @return {Promise}
 *  Resolves if location tracking was started successfully, rejects if it could not obtain sufficient permissions or
 *  location is disabled
 */
export async function startTrackingLocation(requiredPermission: number) {
  const result = await checkLocationStatus();

  if (!result.locationServicesEnabled) {
    throw new FWError({ code: GFWErrorLocation, message: 'Location disabled' });
  }

  if (result.authorization === GFWLocationUnauthorized) {
    const isResolved = Platform.OS === 'android' && (await requestAndroidLocationPermissions());
    // If location services are disabled and the authorization is explicitally denied, return an error.
    if (!isResolved) {
      throw new FWError({ code: GFWErrorPermission, message: 'Permissions denied' });
    }
  }

  // Here, make sure that the result authorization matches the required permission.
  // Also, handle being given higher access than expected.
  // We also must ensure that if the location permission is undetermined, we continue beyond this
  // as otherwise the user is never prompted for their location!
  if (
    result.authorization !== requiredPermission &&
    !(result.authorization === GFWLocationAuthorizedAlways && requiredPermission === GFWLocationAuthorizedInUse) &&
    result.authorization !== GFWLocationUndetermined
  ) {
    const isResolved = Platform.OS === 'android' && (await requestAndroidLocationPermissions());
    if (!isResolved) {
      throw new FWError({ code: GFWErrorPermission, message: 'Incorrect permission given' });
    }
  }

  // On Android the startForeground prop controls whether we show an ongoing notification (when true).
  // Only do this if the requiredPermission indicates that the user wants to track location at ALL times.
  if (Platform.OS === 'android') {
    const requiredForegroundStatus = requiredPermission === GFWLocationAuthorizedAlways;
    const configuration = await getConfiguration();

    if (configuration.startForeground !== requiredForegroundStatus) {
      stopTrackingLocation();
      await configureLocationFramework({
        startForeground: requiredForegroundStatus
      });
      // On Android if we are already running then there's no need to start the tracker again, so just return
    } else if (result.isRunning) {
      return;
    }
  } else {
    // On iOS always stop the tracker and restart it to ensure permission changes are respected
    stopTrackingLocation();
  }

  // At this point, we should have the correct authorization.
  BackgroundGeolocation.on('location', location => {
    mostRecentLocation = location;
    BackgroundGeolocation.startTask(taskKey => {
      emitLocationUpdate(location);
      BackgroundGeolocation.endTask(taskKey);
    });
  });

  BackgroundGeolocation.on('stationary', location => {
    mostRecentLocation = location;
    BackgroundGeolocation.startTask(taskKey => {
      emitLocationUpdate(location);
      BackgroundGeolocation.endTask(taskKey);
    });
  });

  BackgroundGeolocation.on('error', error => {
    BackgroundGeolocation.startTask(taskKey => {
      emitter.emit(GFWOnErrorEvent, { error });
    });
  });

  try {
    // Send an initial location update when tracking is started - this will actually obtain a location fix if there is not one cached
    const initialLocationUpdate = mostRecentLocation ?? (await getCurrentLocation());
    if (initialLocationUpdate) {
      emitLocationUpdate(initialLocationUpdate);
    }
  } catch (err) {
    console.warn('3SC', 'Unexpected failure prior to starting geolocation tracking... continuing...', err);
    Sentry.captureException(err);
  }

  BackgroundGeolocation.start();
}

function emitLocationUpdate(location: Location) {
  emitter.emit(GFWOnLocationEvent, createCompactedLocation(location));
}

/**
 * stopTrackingLocation - Stops... observing location updates.
 * This'll stop BackgroundGeolocation, and remove any listeners.
 *
 * @warning It is the responsibility of the implementing app to deregister any emitter listeners within the main app.
 */
export function stopTrackingLocation() {
  BackgroundGeolocation.stop();
  BackgroundGeolocation.removeAllListeners();
}

/**
 * startTrackingHeading - When called, starts observing compass heading updates!
 *
 * @warning This will only emit a GFWOnHeadingEvent when the heading has changed by 3 or more degrees.
 */
export function startTrackingHeading() {
  console.warn('3SC', 'Need to re-implement startTrackingHeading');
}

/**
 * stopTrackingHeading - Stops observing heading updates.
 * This'll stop RNSimpleCompass.
 *
 * @warning It is the responsibility of the implementing app to deregister any emitter listeners within the main app.
 */
export function stopTrackingHeading() {
  console.warn('3SC', 'Need to re-implement stopTrackingHeading');
}

/**
 * getCoordinateAndDistanceText - Returns the location and distance text.
 */
export function getCoordinateAndDistanceText(
  destinationCoordinates: Array<number>,
  lastPosition: ?Coordinates,
  route: Route,
  coordinatesFormat: CoordinatesFormat,
  isRouteTracking: boolean
) {
  if (isRouteTracking) {
    // Show the destination coordinates.
    return getCoordinateText(route.destination, lastPosition, coordinatesFormat);
  } else if (destinationCoordinates) {
    return getCoordinateText(coordsArrayToObject(destinationCoordinates), lastPosition, coordinatesFormat);
  } else {
    // Show nothing!
    return '';
  }
}

function getCoordinateText(
  targetLocation: ?Coordinates,
  currentLocation: ?Coordinates,
  coordinatesFormat: CoordinatesFormat
) {
  if (targetLocation && currentLocation) {
    const distance = getDistanceOfLine(targetLocation, currentLocation);

    return `${i18n.t('map.destination')} ${formatCoordsByFormat(targetLocation, coordinatesFormat)}\n${i18n.t(
      'map.distance'
    )} ${formatDistance(distance)}`;
  }

  return '';
}

// [1, 2] -> {latitude: 2, longitude: 1}
export function coordsArrayToObject(coord: ?Array<number>) {
  return { latitude: coord?.[1], longitude: coord?.[0] };
}
// {latitude: 2, longitude: 1} -> [1, 2]
export function coordsObjectToArray(coord: ?Coordinates) {
  return [coord?.longitude, coord?.latitude];
}

// returns true for valid lat lng values: { latitude: -1.00, longitude: 50.00 }
export function isValidLatLng(location: { latitude: string, longitude: string }) {
  return !isNaN(Number.parseFloat(location.latitude)) && !isNaN(Number.parseFloat(location.longitude));
}

// returns true for valid lat lng array: [50.00, -1.00]
export function isValidLatLngArray(location: Array<string>) {
  return !isNaN(Number.parseFloat(location[1])) && !isNaN(Number.parseFloat(location[0]));
}

// removes locations with the same position as the previous location in the route
export function removeDuplicateLocations(locations: ?Array<Location>) {
  if (!locations) {
    return null;
  }
  _.reject(locations, function(location, i) {
    return (
      i > 0 && locations[i - 1].latitude === location.latitude && locations[i - 1].longitude === location.longitude
    );
  });
  return locations;
}
