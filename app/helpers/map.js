// @flow

import { Dimensions } from 'react-native';
import { COORDINATES_FORMATS, GLAD_RECENT_RANGE } from 'config/constants';
import UtmLatLng from 'utm-latlng';
import formatcoords from 'formatcoords';
import moment from 'moment';
import i18n from 'i18next';
import type { Coordinates, CoordinatesFormat } from 'types/common.types';
import type { LayersState, ContextualLayer } from 'types/layers.types';
import { coordsArrayToObject, isValidLatLng } from 'helpers/location';
import { isEmpty, removeNulls } from 'helpers/utils';
import { GeoJSONObject } from '@turf/helpers';

import _ from 'lodash';

const kdbush = require('kdbush');
const geokdbush = require('geokdbush');
const geoViewport = require('@mapbox/geo-viewport');

const { width, height } = Dimensions.get('window');

// Use example
// const firstPoint = { latitude: -3.097125, longitude: -45.600375 }
// const points = [{ latitude: -2.337625, longitude: -46.940875 }]
export function getAllNeighbours(firstPoint: Coordinates, points: Coordinates, distance: number = 0.03) {
  // default distance 30m
  const neighbours = [];
  const index = kdbush(points, p => p.longitude, p => p.latitude);

  function isIncluded(result) {
    for (let i = 0; i < neighbours.length; i++) {
      if (result.latitude === neighbours[i].latitude && result.longitude === neighbours[i].longitude) {
        return true;
      }
    }
    return false;
  }

  function checkSiblings(results) {
    for (let i = 0; i < results.length; i++) {
      if (!isIncluded(results[i])) {
        neighbours.push(results[i]);
        getNeighbours(results[i]); // eslint-disable-line
      }
    }
  }

  function getNeighbours(point) {
    // 4 = max results when never should be bigger than 4
    const data = geokdbush.around(index, point.longitude, point.latitude, 4, distance);
    checkSiblings(data);
  }

  getNeighbours(firstPoint);
  // return array of siblings without the point
  if (
    neighbours &&
    neighbours.length &&
    neighbours[0].latitude &&
    neighbours[0].latitude === firstPoint.latitude &&
    neighbours[0].longitude &&
    neighbours[0].longitude === firstPoint.longitude
  ) {
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

export function isDateRecent(date: number) {
  const { measure, range } = GLAD_RECENT_RANGE;
  return moment().diff(moment(date), measure) <= range;
}

export function getContextualLayer(layers: LayersState): ?ContextualLayer {
  if (!layers.activeLayer) {
    return null;
  }
  return layers.data.find(layer => layer.id === layers.activeLayer);
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

export function getMapZoom(region) {
  if (!region.longitude || !region.latitude) {
    return 0;
  }
  const bounds = [
    region.longitude - region.longitudeDelta / 2.5,
    region.latitude - region.latitudeDelta / 2.5,
    region.longitude + region.longitudeDelta / 2.5,
    region.latitude + region.latitudeDelta / 2.5
  ];

  return geoViewport.viewport(bounds, [width, height], 0, 18, 256).zoom || 0;
}

function pointsFromCluster(cluster) {
  if (!cluster || !cluster.length > 0) {
    return [];
  }
  return cluster
    .filter(marker => marker.properties.point_count === undefined)
    .map(feature => coordsArrayToObject(feature));
}

export function getNeighboursSelected(selectedAlerts, markers) {
  let neighbours = [];
  const screenPoints = pointsFromCluster(markers);

  selectedAlerts.forEach(alert => {
    neighbours = [...neighbours, ...getAllNeighbours(alert, screenPoints)];
  });
  // Remove duplicates
  neighbours = neighbours.filter(
    (alert, index, self) =>
      self.findIndex(t => t.latitude === alert.latitude && t.longitude === alert.longitude) === index
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
