// @flow

import { COORDINATES_FORMATS, GLAD_RECENT_RANGE, DATASETS } from 'config/constants';
import UtmLatLng from 'utm-latlng';
import formatcoords from 'formatcoords';
import moment from 'moment';
import type { Coordinates, CoordinatesFormat, Alert } from 'types/common.types';

const kdbush = require('kdbush');
const geokdbush = require('geokdbush');

// Use example
// const firstPoint = { latitude: -3.097125, longitude: -45.600375 }
// const points = [{ latitude: -2.337625, longitude: -46.940875 }]
export function getAllNeighbours(firstPoint: Coordinates, points: Coordinates, distance: number = 0.03) { // default distance 30m
  const neighbours = [];
  const index = kdbush(points, (p) => p.longitude, (p) => p.latitude);

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
  if (neighbours && neighbours.length &&
      neighbours[0].latitude && neighbours[0].latitude === firstPoint.latitude &&
      neighbours[0].longitude && neighbours[0].longitude === firstPoint.longitude) {
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
    features: points.map((value) => ({
      type: 'Map',
      properties: {
        date: value.date,
        isRecent: slug === DATASETS.GLAD
          ? isDateRecent(value.date)
          : false
      },
      geometry: {
        type: 'Point',
        coordinates: [
          value.long,
          value.lat
        ]
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
  }
  // Not utm, not decimal... has to be degrees
  return formatcoords(latitude, longitude).format('FFf', { latLonSeparator: ', ', decimalPlaces: 2 });
}
