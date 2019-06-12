import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import RNSimpleCompass from 'react-native-simple-compass';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

var emitter = require('tiny-emitter/instance');

import { LOCATION_TRACKING } from 'config/constants';

export const GFWLocationAuthorizedAlways = BackgroundGeolocation.AUTHORIZED;
export const GFWLocationAuthorizedInUse = BackgroundGeolocation.AUTHORIZED_FOREGROUND;
export const GFWLocationUnauthorized = BackgroundGeolocation.NOT_AUTHORIZED;
export const GFWOnLocationEvent = 'gfw_onlocation_event';
export const GFWOnStationaryEvent = 'gfw_onstationary_event';
export const GFWOnHeadingEvent = 'gfw_onheading_event';
export const GFWOnErrorEvent = 'gfw_onerror_event';

// These error codes can be found in an enum in /node_modules/@mauron85/react-native-background-geolocation/ios/common/BackgroundGeolocation/MAURProviderDelegate.h
export const GFWErrorPermission = 1000;
export const GFWErrorLocation = 1003;

/**
 * Cache the most recent received location so that we can instantly send a fix to new subscribers
 */
let mostRecentLocation = null;

/**
 * Initialises BackgroundGeolocation with sensible defaults for the usage of GFW tracking
 *
 * @return {Promise}
 */
export async function initialiseLocationFramework() {
  return configureLocationFramework({
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    ...LOCATION_TRACKING
  });
}

/**
 * Wrapper function around BackgroundGeolocation.configure that turns it from callback-based to promise-based
 *
 * @return {Promise}
 */
async function configureLocationFramework(configuration) {
  return new Promise((resolve, reject) => {
    BackgroundGeolocation.configure(configuration, resolve, resolve);
  });
}

/**
 * Wrapper function around BackgroundGeolocation.getConfig that turns it from callback-based to promise-based
 *
 * @return {Promise}
 */
async function getConfiguration() {
  return new Promise((resolve, reject) => {
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
export async function checkLocationStatus() {
  return new Promise((resolve, reject) => {
    BackgroundGeolocation.checkStatus(
      (isRunning, locationServicesEnabled, authorizationStatus) => {
        resolve(isRunning, locationServicesEnabled, authorizationStatus);
      },
      err => {
        resolve(false, false, BackgroundGeolocation.NOT_AUTHORIZED);
      }
    );
  });
}

/**
 * requestAndroidLocationPermissions - When called, requests Android location permissions from the user.
 *
 * @param {function}  grantedCallback A callback that'll be executed if the user gives permission for us to access their location.
 */
async function requestAndroidLocationPermissions() {
  const permissionResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  return permissionResult === true || permissionResult === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * getCurrentLocation - When called, asks BackgroundGeolocation for the user's current location.
 *
 * @param  {function} completion A callback function, that will be called upon either a location being found, or an error being returned.
 * @param  {object} completion.location The location that has been returned.
 * @param  {object} completion.error The error that has been returned while fetching a location.
 */
export async function getCurrentLocation(completion) {
  const result = await checkLocationStatus();

  if (!result.locationServicesEnabled || result.authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
    // If location services are disabled and the authorization is explicitally denied, return an error.
    completion(null, { code: 1, message: 'Permissions denied' });
    return;
  }

  // We've got authorization (or the user hasn't been asked yet) 🎉. Try and find the current location...
  BackgroundGeolocation.getCurrentLocation(
    location => {
      completion(createCompactedLocation(location), null);
    },
    (code, message) => {
      completion(null, { code: code, message: message });
    },
    {
      timeout: 30000,
      enableHighAccuracy: true
    }
  );
}

/**
 * getValidLocations - When called, attempts to find all of the valid locations within the BackgroundGeolocation database.
 * This searches specifically for valid locations, as invalid ones are 'deleted' and should not be used.
 *
 * @param  {function}             completion A callback that'll be executed when the locations have been found.
 * @param  {array<LocationPoint>} completion.locations An array of location placemarks, that were retrieved from the database.
 * @param  {object}               completion.error An error that occurred while attempting to fetch locations.
 */
export function getValidLocations(completion) {
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
function createCompactedLocation(location) {
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
export async function deleteAllLocations() {
  return new Promise((resolve, reject) => {
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
export async function startTrackingLocation(requiredPermission) {
  const result = await checkLocationStatus();

  if (!result.locationServicesEnabled || result.authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
    const isResolved = Platform.OS === 'android' && (await requestAndroidLocationPermissions());
    // If location services are disabled and the authorization is explicitally denied, return an error.
    if (!isResolved) {
      throw { code: 1000, message: 'Permissions denied' };
    }
  }

  // Here, make sure that the result authorization matches the required permission.
  // Also, handle being given higher access than expected.
  if (
    result.authorization !== requiredPermission &&
    !(
      result.authorization === BackgroundGeolocation.AUTHORIZED &&
      requiredPermission === BackgroundGeolocation.AUTHORIZED_FOREGROUND
    )
  ) {
    const isResolved = Platform.OS === 'android' && (await requestAndroidLocationPermissions());
    if (!isResolved) {
      throw { code: 1000, message: 'Incorrect permission given' };
    }
  }

  // On Android the startForeground prop controls whether we show an ongoing notification (when true).
  // Only do this if the requiredPermission indicates that the user wants to track location at ALL times.
  if (Platform.OS === 'android') {
    const requiredForegroundStatus = requiredPermission === BackgroundGeolocation.AUTHORIZED;
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
    await deleteAllLocations();
  } finally {
    BackgroundGeolocation.start();
    if (mostRecentLocation) {
      emitLocationUpdate(mostRecentLocation);
    }
  }
}

function emitLocationUpdate(location) {
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
  RNSimpleCompass.start(3, degree => {
    emitter.emit(GFWOnHeadingEvent, degree);
  });
}

/**
 * stopTrackingHeading - Stops observing heading updates.
 * This'll stop RNSimpleCompass.
 *
 * @warning It is the responsibility of the implementing app to deregister any emitter listeners within the main app.
 */
export function stopTrackingHeading() {
  RNSimpleCompass.stop();
}
