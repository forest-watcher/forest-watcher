import { checkImageFolder, cacheImageByUrl } from 'helpers/fileManagement';

const tilebelt = require('@mapbox/tilebelt');
const pMap = require('p-map');


export function getBboxTiles(bbox, zooms) {
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

export async function cacheTiles(tiles, areaId) {
  const folder = `tiles/${areaId}`;
  await checkImageFolder(folder);
  const mapper = tile => {
    const imageName = `${tile[2]}x${tile[0]}x${tile[1]}.png`;
    const url = `http://wri-tiles.s3.amazonaws.com/glad_prod/tiles/${tile[2]}/${tile[0]}/${tile[1]}.png`;
    return cacheImageByUrl(url, folder, imageName);
  };
  await pMap(tiles, mapper, { concurrency: 10 });
}
