const kdbush = require('kdbush');
const geokdbush = require('geokdbush');

// default distance 30m
function getAllNeighbours(firstPoint, points, distance = 0.03) {
  const neighbours = [];
  const index = kdbush(points, (p) => p.lon, (p) => p.lat);

  function isIncluded(result) {
    for (let i = 0; i < neighbours.length; i++) {
      if (result.lat === neighbours[i].lat && result.lon === neighbours[i].lon) {
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
    const data = geokdbush.around(index, point.lon, point.lat, 4, distance);
    checkSiblings(data);
  }

  getNeighbours(firstPoint);
  // return array of siblings including the point
  return neighbours;
}

// Use example
// const firstPoint = { lat: -3.097125, lon: -45.600375 }
// const points = [{ "lat": -2.337625, "lon": -46.940875 }]
// const total = getAllNeighbours(firstPoint, points);

export default getAllNeighbours;
