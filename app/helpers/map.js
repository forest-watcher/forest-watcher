// @flow

import type { Coordinates, CoordinatesFormat, MapItemFeatureProperties } from 'types/common.types';
import type { Alert, SelectedAlert } from 'types/alerts.types';
import type { AlertsIndex } from 'components/map/alerts/dataset-category';

import { COORDINATES_FORMATS, DATASET_CATEGORIES } from 'config/constants';
import UtmLatLng from 'utm-latlng';
import formatcoords from 'formatcoords';
import i18n from 'i18next';
import { isValidLatLng } from 'helpers/validation/location';
import { isEmpty, removeNulls } from 'helpers/utils';
import { point, type Feature, type GeometryObject, type GeoJSONObject, type Properties } from '@turf/helpers';
import distanceBetweenCoordinates from '@turf/distance';
import pointToLineDistance from '@turf/point-to-line-distance';
import _ from 'lodash';
import geokdbush from 'geokdbush';

/**
 * Formats string for alerts selected on map
 *
 * e.g. if 2 GLAD alerts and 5 RADD alerts selected will read:
 * "2 GLAD, 5 RADD"
 *
 * @param {Object[]} alerts - The alerts that are selected
 * @returns {string} A formated string
 */
export function formatSelectedAlertTypeCounts(alerts: Array<MapItemFeatureProperties>): string {
  const countsByType = _.countBy(alerts, alert => i18n.t(`map.selectedItems.alertType.${alert.datasetId}`));
  return Object.entries(countsByType)
    .map(entry => {
      const [datasetName, count] = entry;
      return i18n.t('map.selectedItems.alertCount', {
        type: datasetName,
        count
      });
    })
    .join(', ');
}

/**
 * Formats string for alert categories selected on map
 *
 * e.g. if 2 GLAD alerts and 5 VIIRS alerts selected will read:
 * "Deforestation and Fire Alerts"
 *
 * @param {Object[]} alerts - The alerts that are selected
 * @returns {string} A formated string
 */
export function formatSelectedAlertCategories(alerts: Array<MapItemFeatureProperties>): string {
  const categoryIds = alerts.map(alert => {
    const { id } = Object.values(DATASET_CATEGORIES).find(category => category.datasetSlugs.includes(alert.datasetId));
    return id;
  });
  const uniqueCategoryIds = _.uniq(categoryIds).sort();
  return i18n.t(`map.selectedItems.alertCategories.${uniqueCategoryIds.join('')}`, { count: alerts.length });
}

// Use example
// const firstPoint = { latitude: -3.097125, longitude: -45.600375 }
// const points = [{ latitude: -2.337625, longitude: -46.940875 }]
function getAllNeighbours(
  alertsIndex: AlertsIndex,
  firstPoint: SelectedAlert,
  points: Array<Alert>,
  distance: number = 0.03,
  includingFirstPoint: boolean = true
): Array<Alert> {
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

  function getNeighbours(point: Alert | SelectedAlert) {
    const data = geokdbush.around(alertsIndex, point.long, point.lat, 8, distance);
    checkSiblings(data);
  }

  getNeighbours(firstPoint);
  // return array of siblings without the point
  if (
    !includingFirstPoint &&
    neighbours?.length &&
    neighbours[0]?.lat === firstPoint.lat &&
    neighbours[0]?.long === firstPoint.long
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
    // $FlowFixMe
    return `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}`;
  } else {
    // Not utm, not decimal... has to be degrees
    return formatcoords(latitude, longitude).format('FFf', { latLonSeparator: ', ', decimalPlaces: 2 });
  }
}

export function getNeighboursSelected(
  alertsIndex: AlertsIndex,
  selectedAlerts: $ReadOnlyArray<SelectedAlert | Alert>,
  allAlerts: Array<Alert>,
  includingSelectedAlerts: boolean = true
): Array<Alert> {
  let neighbours: Array<Alert> = [];
  let selectedAlertsCopy: Array<SelectedAlert> = [...selectedAlerts];

  while (selectedAlertsCopy.length > 0) {
    // We get the last alert so we can use `.pop()` which is more performant
    // than `.shift()`
    const alert = selectedAlertsCopy[selectedAlertsCopy.length - 1];
    neighbours = [...neighbours, ...getAllNeighbours(alertsIndex, alert, allAlerts, 0.03, includingSelectedAlerts)];
    // Remove the current alert from the array
    selectedAlertsCopy.pop();
    // Remove selected alerts that were already detected in neighbours as we will have
    // already also found those alert's neighbours in the original search!
    selectedAlertsCopy = selectedAlertsCopy.filter((alert: SelectedAlert) => {
      return (
        neighbours.findIndex(
          t => t.lat === alert.lat && t.long === alert.long && (t.slug === alert.datasetId || t.slug === alert.slug)
        ) === -1
      );
    });
  }

  // Remove duplicates
  neighbours = neighbours.filter(
    (alert: Alert | SelectedAlert, index: number, self) =>
      self.findIndex(t => t.lat === alert.lat && t.long === alert.long) === index
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
export function getDistanceOfLine(endLocation: Coordinates, startLocation: Coordinates): number {
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
export function getDistanceOfPolyline(locations: Array<Coordinates>): number {
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
export function formatDistance(
  distance: number,
  thresholdBeforeKm: number = 1,
  relativeToUser: boolean = true
): string {
  let distanceText = `${distance.toFixed(0)}${
    relativeToUser ? i18n.t('commonText.metersAway') : i18n.t('commonText.meters')
  }`;

  if (thresholdBeforeKm != null && distance >= thresholdBeforeKm * 1000) {
    const roundedDistance = (distance / 1000).toFixed(1); // in Kilometers
    distanceText = `${roundedDistance}${
      relativeToUser ? i18n.t('commonText.kmAway') : i18n.t('commonText.kilometers')
    }`;
  }

  return distanceText;
}

/**
 * returns bounding box for any given polygon (lat,lng array)
 * @param polygon [{latitude: *, longitude: *}, ...]
 * @returns {{sw: [*, *], ne: [*, *]}}
 */
export function getPolygonBoundingBox(
  polygon: ?$ReadOnlyArray<Coordinates>
): ?{ ne: [number, number], sw: [number, number] } {
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
export function closestFeature<G: GeometryObject, P: Properties>(
  features: Array<Feature<G, P>>,
  coordinate: Coordinates
): Feature<G, P> {
  const coordinatePoint = point([coordinate.longitude, coordinate.latitude]);
  const geometryFeatures = features.filter((feature: Feature<G, P>) => !!feature.geometry);
  return _.minBy(geometryFeatures, feature => {
    const geometry = feature.geometry;
    switch (geometry.type) {
      case 'Point': {
        return distanceBetweenCoordinates(coordinatePoint, geometry);
      }
      case 'LineString': {
        return pointToLineDistance(coordinatePoint, geometry);
      }
      default: {
        console.warn(`Unexpected geometry type: ${geometry.type} sent to closestFeature helper`);
      }
    }
    return undefined;
  });
}
