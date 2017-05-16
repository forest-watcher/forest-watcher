import { checkImageFolder, cacheImageByUrl } from 'helpers/fileManagement';
import CONSTANTS from 'config/constants';

const tilebelt = require('@mapbox/tilebelt');


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

export async function cacheTiles(tiles, areaId, dataset) {
  const folder = `${CONSTANTS.maps.tilesFolder}/${areaId}/${dataset}`;
  await checkImageFolder(folder);
  const CONCURRENCY = 10;
  let arrayPromises = [];
  for (let i = 0, tLength = tiles.length; i < tLength; i++) {
    const imageName = `${tiles[i][2]}x${tiles[i][0]}x${tiles[i][1]}.png`;
    const url = `${CONSTANTS.tileServers.glad}/${tiles[i][2]}/${tiles[i][0]}/${tiles[i][1]}.png`;
    arrayPromises.push(cacheImageByUrl(url, folder, imageName));
    if (i % CONCURRENCY === 0 && i > 0) {
      await Promise.all(arrayPromises);
      arrayPromises = [];
    }
  }
  if (arrayPromises.length > 0) {
    await Promise.all(arrayPromises);
  }
}
