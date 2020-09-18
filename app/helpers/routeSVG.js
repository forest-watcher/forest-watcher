// @flow
import type { LocationPoint } from 'types/routes.types';
import { getPolygonBoundingBox } from 'helpers/map';

/**
 * Earth's radius in metres
 */
const EARTH_RADIUS = 6.3781e6;

function degToRadians(degrees: number): number {
  const pi = Math.PI;
  return degrees * (pi / 180);
}

/**
 * Converts a lat/lng bounding box to a cartesian version of the same box with an aspect ratio of 1:1 centered around
 * the original boxes central coordinate
 *
 * @param bbox {object} bbox The original lat/lng bounding box
 * @return {object} The new bounding box as cartesian sw.x, sw.y, ne.x, ne.y
 */
function toCartesianSquareBoundingBox(
  bbox: ?{
    sw: Array<number>,
    ne: Array<number>
  }
): ?{ sw: { x: number, y: number }, ne: { x: number, y: number } } {
  if (!bbox) {
    return null;
  }
  // Make sure original object has enough length to get both lat and lng for all bounding points
  if (bbox.ne?.length < 2 || bbox.sw?.length < 2) {
    return null;
  }

  // Get central lat and take cosine for use in conversion to x/y
  const centerLat = (bbox.ne[1] + bbox.sw[1]) / 2;
  const cosCenterLat = Math.cos(degToRadians(centerLat));

  // Convert original bbox points to x/y
  const neCartesian = {
    x: EARTH_RADIUS * bbox.ne[0] * cosCenterLat,
    y: EARTH_RADIUS * bbox.ne[1]
  };

  const swCartesian = {
    x: EARTH_RADIUS * bbox.sw[0] * cosCenterLat,
    y: EARTH_RADIUS * bbox.sw[1]
  };

  // Get width and height of cartesian bounding box
  const bboxWidth = Math.abs(neCartesian.x - swCartesian.x);
  const bboxHeight = Math.abs(neCartesian.y - swCartesian.y);

  // If the original box is wider than it is tall
  if (bboxWidth > bboxHeight) {
    // Offset return value from the centerY of the original box, by it's width (longer of two sides)
    const centerY = swCartesian.y + bboxHeight / 2;
    return {
      sw: {
        x: swCartesian.x,
        y: centerY - bboxWidth / 2
      },
      ne: {
        x: neCartesian.x,
        y: centerY + bboxWidth / 2
      }
    };
  } else {
    // Offset return value from the centerX of the original box, by it's width (longer of two sides)
    const centerX = swCartesian.x + bboxWidth / 2;
    return {
      sw: {
        x: centerX - bboxHeight / 2,
        y: swCartesian.y
      },
      ne: {
        x: centerX + bboxHeight / 2,
        y: neCartesian.y
      }
    };
  }
}

/**
 * Creates an SVG path using relative points for a given set of route `LocationPoint` objects
 *
 * @param {array<LocationPoint} routePoints An array of location points to use to generate the SVG line
 * @param {number} size The size of the SVG
 */
export function routeSVGProperties(
  routePoints: Array<LocationPoint>,
  size: number
): ?{ path: string, firstPoint: { x: string, y: string }, lastPoint: { x: string, y: string } } {
  if (routePoints.length < 2) {
    return null;
  }
  const latLngBbox = getPolygonBoundingBox(routePoints);
  const bbox = toCartesianSquareBoundingBox(latLngBbox);

  if (!bbox || !latLngBbox) {
    return null;
  }

  // Get the center latitude for calculation of cartesian points in the route
  const centerLat = (latLngBbox.ne[1] + latLngBbox.sw[1]) / 2;
  // Take this to use as a constant when converting lng/lat to x/y
  const cosCenterLat = Math.cos(degToRadians(centerLat));

  const bboxWidth = Math.abs(bbox.ne.x - bbox.sw.x);

  let svgString = '';
  const firstPoint = {
    x: '0',
    y: '0'
  };
  const lastPoint = {
    x: '0',
    y: '0'
  };

  routePoints.forEach((point, index) => {
    // Convert to cartesian
    const x = EARTH_RADIUS * point.longitude * cosCenterLat;
    const y = EARTH_RADIUS * point.latitude;
    // Get the points relative to the bounding box, which we need for drawing
    const relativeX = ((x - bbox.sw.x) / bboxWidth) * size;
    const relativeY = size - ((y - bbox.sw.y) / bboxWidth) * size;

    // Move to first point
    if (index === 0) {
      svgString += `M ${relativeX} ${relativeY}`;
      firstPoint.x = `${relativeX}`;
      firstPoint.y = `${relativeY}`;
    } else if (index === routePoints.length - 1) {
      // Add line to the remaining points
      svgString += `L ${relativeX} ${relativeY}`;
      lastPoint.x = `${relativeX}`;
      lastPoint.y = `${relativeY}`;
    } else {
      svgString += `L ${relativeX} ${relativeY}`;
    }
  });

  return { path: svgString, firstPoint, lastPoint };
}
