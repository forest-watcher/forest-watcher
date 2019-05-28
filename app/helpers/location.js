import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import RNSimpleCompass from 'react-native-simple-compass';
import { PermissionsAndroid } from 'react-native';

var emitter = require('tiny-emitter/instance');

import { LOCATION_TRACKING } from 'config/constants';

export const GFWLocationAuthorizedAlways = BackgroundGeolocation.AUTHORIZED;
export const GFWLocationUnauthorized = BackgroundGeolocation.NOT_AUTHORIZED;
export const GFWOnLocationEvent = 'gfw_onlocation_event';
export const GFWOnStationaryEvent = 'gfw_onstationary_event';
export const GFWOnHeadingEvent = 'gfw_onheading_event';

/**
 * configureLocationFramework - Configures the BackgroundGeolocation framework.
 */
export function configureLocationFramework() {
  BackgroundGeolocation.configure({
    desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
    stationaryRadius: LOCATION_TRACKING.stationaryRadius,
    distanceFilter: LOCATION_TRACKING.distanceFilter,
    startOnBoot: LOCATION_TRACKING.startOnBoot,
    stopOnTerminate: LOCATION_TRACKING.stopOnTerminate,
    locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
    interval: LOCATION_TRACKING.interval,
    fastestInterval: LOCATION_TRACKING.fastestInterval,
    activitiesInterval: LOCATION_TRACKING.activitiesInterval,
    stopOnStillActivity: LOCATION_TRACKING.stopOnStillActivity
  });
}

/**
 * checkLocationStatus - When called, checks the status of BackgroundGeolocation.
 *
 * @param {function}  completion A callback that'll be called with the below parameters.
 * @param {boolean}   completion.isRunning Defines if we're currently monitoring location updates.
 * @param {boolean}   completion.locationServicesEnabled Defines if location services are currently enabled or not.
 * @param {number}    completion.authorization Defines the current location permission status.
 */
export function checkLocationStatus(completion) {
  BackgroundGeolocation.checkStatus(completion, () => {
    completion(false, false, BackgroundGeolocation.NOT_AUTHORIZED);
  });
}

/**
 * getCurrentLocation - When called, asks BackgroundGeolocation for the user's current location.
 *
 * @param  {function} completion A callback function, that will be called upon either a location being found, or an error being returned.
 * @param  {object} completion.location The location that has been returned.
 * @param  {object} completion.error The error that has been returned while fetching a location.
 */
export function getCurrentLocation(completion) {
  checkLocationStatus(result => {
    if (!result.locationServicesEnabled && result.authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
      // If location services are disabled and the authorization is explicitally denied, return an error.
      completion(null, { code: 1, message: 'Permissions denied' });
      return;
    }

    // We've got authorization (or the user hasn't been asked yet) 🎉. Try and find the current location...
    BackgroundGeolocation.getCurrentLocation(
      location => {
        completion(location, null);
      },
      (code, message) => {
        completion(null, { code: code, message: message });
      },
      {
        timeout: 30000,
        enableHighAccuracy: true
      }
    );
  });
}

/**
 * startTrackingLocation - When called, attempts to start observing location updates.
 * If we don't have permission, we need to show an error.
 * If we have permission, we can register our listeners and start... listening...
 *
 * @param  {number}   requiredPermission   The required permission that we need.
 *    For example, while listening on the map screen we only need while in use, but while route tracking we need always.
 * @param  {function} completion        A callback that'll be executed on either receiving an error, or upon successfully starting.
 * @param  {object}   completion.error  Defines an error if one occurred. If location observing started, this'll be null.
 */
export function startTrackingLocation(requiredPermission, completion) {
  checkLocationStatus(result => {
    if (!result.locationServicesEnabled && result.authorization === BackgroundGeolocation.NOT_AUTHORIZED) {
      // If location services are disabled and the authorization is explicitally denied, return an error.
      completion({ code: 1, message: 'Permissions denied' });
      return;
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
      completion({ code: 1, message: 'Incorrect permission given' });
      return;
    }

    // At this point, we should have the correct authorization.
    BackgroundGeolocation.on('location', location => {
      BackgroundGeolocation.startTask(taskKey => {
        emitter.emit(GFWOnLocationEvent, location);
        // todo: store location in redux.
        BackgroundGeolocation.endTask(taskKey);
      });
    });

    BackgroundGeolocation.on('stationary', stationaryLocation => {
      emitter.emit(GFWOnStationaryEvent, location);
      // todo: store location in redux.
    });

    // todo: handle errors / other events.

    BackgroundGeolocation.start();
    completion(null);
  });
}

/**
 * stopTrackingLocation - Stops... observing location updates.
 * This'll stop BackgroundGeolocation, and remove any listeners.
 *
 * @warning It is the responsibility of the implementing app to deregister any emitter listeners within the main app.
 */
export function stopTrackingLocation() {
  BackgroundGeolocation.stop();

  // todo: remove event listeners
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

export async function requestAndroidLocationPermissions(grantedCallback) {
  const permissionResult = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
  if (permissionResult === true || permissionResult === PermissionsAndroid.RESULTS.GRANTED) {
    grantedCallback();
  }
}
