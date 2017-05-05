const tilebelt = require('@mapbox/tilebelt');

export function getBboxTiles(bbox, zooms) { // eslint-disable-line
  const tilesArray = [];
  const zoomsArray = typeof zooms === 'number'
    ? [zooms]
    : zooms;
  zoomsArray.forEach((zoom) => {
    const pointTiles = bbox.map(point => tilebelt.pointToTile(point.lat, point.lng, zoom));
    const tiles = {
      x: [pointTiles[0][0], pointTiles[1][0]],
      y: [pointTiles[0][1], pointTiles[1][1]]
    };
    for (let x = tiles.x[0], xLength = tiles.x[1]; x <= xLength; x++) {
      for (let y = tiles.y[0], yLength = tiles.y[1]; y <= yLength; y++) {
        tilesArray.push([x, y, zoom]);
      }
    }
  });
  return tilesArray;
}

// TODO: move this to the areas component to save the
// tiles of the area
// Example of use
// const zooms = [10, 11, 12];
// const bbox = [
//   { lat: -74.52644348144531, lng: -8.397658311120537 },
//   { lat: -74.30465698242188, lng: -8.606820784079316 }
// ];
// const tilesArray = getBboxTiles(bbox, zooms);
// console.log(tilesArray);
