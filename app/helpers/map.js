// @flow

import { Dimensions } from 'react-native';
import { COORDINATES_FORMATS, GLAD_RECENT_RANGE, DATASETS } from 'config/constants';
import UtmLatLng from 'utm-latlng';
import formatcoords from 'formatcoords';
import moment from 'moment';
import i18n from 'locales';
import type { Coordinates, CoordinatesFormat, Alert } from 'types/common.types';

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

export function isDateRecent(date: number) {
  const { measure, range } = GLAD_RECENT_RANGE;
  return moment().diff(moment(date), measure) <= range;
}

export function pointsToGeoJSON(points: Array<Alert>, slug: string) {
  return {
    type: 'MapCollection',
    features: points.map(value => ({
      type: 'Map',
      properties: {
        date: value.date,
        isRecent: slug === DATASETS.GLAD ? isDateRecent(value.date) : false
      },
      geometry: {
        type: 'Point',
        coordinates: [value.long, value.lat]
      }
    }))
  };
}

export function getContextualLayer(layers) {
  if (!layers.activeLayer) return null;
  return layers.data.find(layer => layer.id === layers.activeLayer);
}

export function formatCoordsByFormat(coordinates: Coordinates, format: CoordinatesFormat) {
  const { latitude, longitude } = coordinates;
  if (format === COORDINATES_FORMATS.utm.value) {
    const utm = new UtmLatLng();
    const utmCoords = utm.convertLatLngToUtm(latitude, longitude, 0);
    return `${utmCoords.ZoneNumber} ${utmCoords.ZoneLetter}, ${utmCoords.Easting} E ${utmCoords.Northing} N`;
  } else if (format === COORDINATES_FORMATS.decimal.value) {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } else {
    // Not utm, not decimal... has to be degrees
    return formatcoords(latitude, longitude).format('FFf', { latLonSeparator: ', ', decimalPlaces: 2 });
  }
}

export function getMapZoom(region) {
  if (!region.longitude || !region.latitude) return 0;
  const bounds = [
    region.longitude - region.longitudeDelta / 2.5,
    region.latitude - region.latitudeDelta / 2.5,
    region.longitude + region.longitudeDelta / 2.5,
    region.latitude + region.latitudeDelta / 2.5
  ];

  return geoViewport.viewport(bounds, [width, height], 0, 18, 256).zoom || 0;
}

function pointsFromCluster(cluster) {
  if (!cluster || !cluster.length > 0) return [];
  return cluster
    .filter(marker => marker.properties.point_count === undefined)
    .map(feature => ({
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1]
    }));
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

function getDistance(endLocation, startLocation) {
  return (
    geokdbush.distance(endLocation.longitude, endLocation.latitude, startLocation.longitude, startLocation.latitude) *
    1000
  );
}

export function getDistanceFormattedText(endLocation, startLocation, thresholdBeforeKm) {
  let metresDistance = getDistance(endLocation, startLocation);
  let distance = metresDistance.toFixed(0);

  let distanceText = `${distance} ${i18n.t('commonText.metersAway')}`;

  if (thresholdBeforeKm && metresDistance >= thresholdBeforeKm * 1000) {
    distance = (metresDistance / 1000).toFixed(1); // in Kilometers
    distanceText = `${distance} ${i18n.t('commonText.kmAway')}`;
  }

  return distanceText;
}
