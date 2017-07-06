const kdbush = require('kdbush');
const geokdbush = require('geokdbush');

// Use example
// const firstPoint = { latitude: -3.097125, longitude: -45.600375 }
// const points = [{ latitude: -2.337625, longitude: -46.940875 }]
export function getAllNeighbours(firstPoint, points, distance = 0.03) { // default distance 30m
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

export function pointsToGeoJSON(points) {
  return {
    type: 'MapCollection',
    features: points.map((value) => ({
      type: 'Map',
      properties: {
        lat: value.lat,
        long: value.long,
        date: value.date
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

export function pointsFromGeojson(geojson) {
  if (!geojson || !geojson.features) return [];
  return geojson.features.map((feature) => ({
    lon: feature.geometry.coordinates[0],
    lat: feature.geometry.coordinates[1]
  }));
}
