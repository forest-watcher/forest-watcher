// @flow

import { COORDINATES_FORMATS } from 'config/constants';
import UtmLatLng from 'utm-latlng';
import formatcoords from 'formatcoords';
import i18n from 'i18next';
import type { Coordinates, CoordinatesFormat } from 'types/common.types';
import { isValidLatLng } from 'helpers/location';
import { isEmpty, removeNulls } from 'helpers/utils';
import { GeoJSONObject, point, lineString, type Feature } from '@turf/helpers';
import distanceBetweenCoordinates from '@turf/distance';
import pointToLineDistance from '@turf/point-to-line-distance';
import _ from 'lodash';
import type { Alert } from 'types/alerts.types';
import type { AlertsIndex } from 'components/map/alerts/dataset';
import geokdbush from 'geokdbush';

// Use example
// const firstPoint = { latitude: -3.097125, longitude: -45.600375 }
// const points = [{ latitude: -2.337625, longitude: -46.940875 }]
export function getAllNeighbours(
  alertsIndex: AlertsIndex,
  firstPoint: Alert,
  points: Array<Alert>,
  distance: number = 0.03
) {
  // default distance 30m - alerts are about 27.5m apart on the map (39m diagonally)
  const neighbours: Array<Alert> = [];

  function isIncluded(result: Alert) {
    for (let i = 0; i < neighbours.length; i++) {
      if (result.lat === neighbours[i].lat && result.long === neighbours[i].long) {
        return true;
      }
    }
    return false;
  }

  function checkSiblings(results: Array<Alert>) {
    for (let i = 0; i < results.length; i++) {
      if (!isIncluded(results[i])) {
        neighbours.push(results[i]);
        getNeighbours(results[i]);
      }
    }
  }

  function getNeighbours(point: Alert) {
    const data = geokdbush.around(alertsIndex, point.long, point.lat, 8, distance);
    checkSiblings(data);
  }

  getNeighbours(firstPoint);
  // return array of siblings without the point
  if (neighbours?.length && neighbours[0]?.lat === firstPoint.lat && neighbours[0]?.long === firstPoint.long) {
    neighbours.shift();
  }
  return neighbours;
}

/**
 * Removes any `features` from a GeoJSON file with `FeatureCollection` as the root object that have null geometries,
 * cleans out any `null` in `coordinates` arrays
 *
 * @param {Object} geojson The GeoJSON to remove null geometries from
 * @returns {Object} validated GeoJSON
 */
export function cleanGeoJSON(geojson: GeoJSONObject): GeoJSONObject {
  if (geojson?.type === 'FeatureCollection' && !!geojson.features) {
    return {
      ...geojson,
      features: geojson.features
        .filter(feature => {
          return !!feature.geometry && !isEmpty(feature.geometry.coordinates);
        })
        .map(feature => {
          return {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: removeNulls(feature.geometry.coordinates)
            }
          };
        })
    };
  } else if (geojson?.type === 'Feature' && !!geojson.geometry) {
    return {
      ...geojson,
      geometry: {
        ...geojson.geometry,
        coordinates: removeNulls(geojson.geometry.coordinates)
      }
    };
  } else if (geojson?.type === 'GeometryCollection' && !!geojson.geometries) {
    return {
      ...geojson,
      geometries: geojson.geometries.map(geometry => {
        return cleanGeoJSON(geometry);
      })
    };
  } else if (geojson.coordinates) {
    return {
      ...geojson,
      coordinates: removeNulls(geojson.coordinates)
    };
  }
  return geojson;
}

export function formatCoordsByFormat(coordinates: Coordinates, format: CoordinatesFormat) {
  if (!isValidLatLng(coordinates)) {
    return '';
  }
  const { latitude, longitude } = coordinates;
  if (format === COORDINATES_FORMATS.utm.value) {
    const utm = new UtmLatLng();
    const utmCoords = utm.convertLatLngToUtm(latitude, longitude, 0);
    return `${utmCoords.ZoneNumber} ${utmCoords.ZoneLetter}, ${utmCoords.Easting} E ${utmCoords.Northing} N`;
  } else if (format === COORDINATES_FORMATS.decimal.value) {
    return `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`;
  } else {
    // Not utm, not decimal... has to be degrees
    return formatcoords(latitude, longitude).format('FFf', { latLonSeparator: ', ', decimalPlaces: 2 });
  }
}

export function getNeighboursSelected(alertsIndex: AlertsIndex, selectedAlerts: Array<Alert>, allAlerts: Array<Alert>) {
  let neighbours = [];

  selectedAlerts.forEach(alert => {
    neighbours = [...neighbours, ...getAllNeighbours(alertsIndex, alert, allAlerts)];
  });
  // Remove duplicates
  neighbours = neighbours.filter(
    (alert, index, self) => self.findIndex(t => t.lat === alert.lat && t.long === alert.long) === index
  );
  return neighbours;
}

/**
 * Calculates the distance in metres between two points
 *
 * @param endLocation.latitude
 * @param endLocation.longitude
 * @param startLocation.latitude
 * @param startLocation.longitude
 * @return {number}
 *  Distance in metres
 */
export function getDistanceOfLine(endLocation, startLocation) {
  return (
    geokdbush.distance(endLocation.longitude, endLocation.latitude, startLocation.longitude, startLocation.latitude) *
    1000
  );
}

/**
 * Calculates the total distance in metres by summing the distance between each successive pair of points
 *
 * @param locations.latitude
 * @param locations.longitude
 * @return {number}
 *  Total distance in metres
 */
export function getDistanceOfPolyline(locations) {
  let cumulativeDistance = 0;

  if (locations.length < 2) {
    return cumulativeDistance;
  }

  let prevLocation = locations[0];

  locations.slice(1).forEach(location => {
    cumulativeDistance += getDistanceOfLine(location, prevLocation);
    prevLocation = location;
  });

  return cumulativeDistance;
}

/**
 * Formats the provided distance in either metres or kilometres as a localised string
 *
 * @param distance
 *  Distance in metres
 * @param thresholdBeforeKm
 * @return {string}
 */
export function formatDistance(distance, thresholdBeforeKm = 1, relativeToUser = true) {
  let distanceText = `${distance.toFixed(0)}${
    relativeToUser ? i18n.t('commonText.metersAway') : i18n.t('commonText.meters')
  }`;

  if (thresholdBeforeKm && distance >= thresholdBeforeKm * 1000) {
    distance = (distance / 1000).toFixed(1); // in Kilometers
    distanceText = `${distance}${relativeToUser ? i18n.t('commonText.kmAway') : i18n.t('commonText.kilometers')}`;
  }

  return distanceText;
}

/**
 * returns bounding box for any given polygon (lat,lng array)
 * @param polygon [{latitude: *, longitude: *}, ...]
 * @returns {{sw: [*, *], ne: [*, *]}}
 */
export function getPolygonBoundingBox(polygon) {
  if (!polygon || polygon.length === 0) {
    return undefined;
  }

  return {
    ne: [_.maxBy(polygon, x => x.longitude).longitude, _.maxBy(polygon, x => x.latitude).latitude],
    sw: [_.minBy(polygon, x => x.longitude).longitude, _.minBy(polygon, x => x.latitude).latitude]
  };
}

/**
 * Returns the closest feature to a given lat/lng touch position based
 * on the distance from the center of the individual features.
 * @param features [Feature] the features to return the closes value to
 * @param coordinate {latitude: number, longitude: number} The point to return the nearest feature to
 *
 * @returns Feature
 */
export function closestFeature(features: Array<Feature>, coordinate: { longitude: number, latitude: number }) {
  const coordinatePoint = point([coordinate.longitude, coordinate.latitude]);
  const geometryFeatures = features.filter((feature: Feature) => !!feature.geometry);
  return _.minBy(geometryFeatures, feature => {
    const geometry = feature.geometry;
    switch (geometry.type) {
      case 'Point': {
        const geometryPoint = point(geometry.coordinates);
        return distanceBetweenCoordinates(coordinatePoint, geometryPoint);
      }
      case 'LineString': {
        const geometryLineString = lineString(geometry.coordinates);
        return pointToLineDistance(coordinatePoint, geometryLineString);
      }
      default: {
        console.warn(`Unexpected geometry type: ${geometry.type} sent to closestFeature helper`);
      }
    }
    return undefined;
  });
}
