// @flow

import type { LayerFile } from 'types/sharing.types';
import tilebelt from '@mapbox/tilebelt';
import turfBBox from '@turf/bbox';
import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import { layerRootDir, type LayerType, pathForLayer, pathForLayerFile } from 'helpers/layer-store/layerFilePaths';

const RNFS = require('react-native-fs');

/**
 * Stores a custom layer in a standard file system structure
 *
 * @param type
 * @param id
 * @param sourcePath
 *  The directory to store. Files are copied relative to this source directory.
 * @param files
 * @return {Promise<void>}
 */
export async function storeCustomLayer(
  type: LayerType,
  id: string, // TODO: Maybe generate this in here as a UUID and return it?
  sourcePath: string,
  files: Array<LayerFile>
) {
  const rootPath = pathForLayer(type, id);

  // eslint-disable-next-line no-unused-vars
  for (const file of files) {
    const enclosingPolygon = file.polygon;

    if (!enclosingPolygon) {
      throw new Error('All layer files must have a polygon');
    }

    const bbox = turfBBox(enclosingPolygon);
    const tileXYZ = tilebelt.bboxToTile(bbox);
    const tileDirName = `${tileXYZ[2]}x${tileXYZ[0]}x${tileXYZ[1]}`;
    const tileDirPath = `${rootPath}/${tileDirName}`;

    const sourceUri = file.uri;

    if (!sourceUri.startsWith(sourcePath)) {
      throw new Error('All layer files must be contained inside sourcePath');
    }

    const sourceUriRel = sourceUri.replace(sourcePath, '');
    const destinationUri = `${tileDirPath}${sourceUriRel}`;
    const destinationDirUri = destinationUri
      .split('/')
      .slice(0, -1)
      .join('/');

    await RNFS.mkdir(destinationDirUri);
    await RNFS.copyFile(sourceUri, destinationUri);
  }
}

export async function storeLayerFiles(files: Array<LayerFile>, dir: string = layerRootDir()) {
  // eslint-disable-next-line no-unused-vars
  for (const file of files) {
    const destinationUri = pathForLayerFile(file, dir);

    if (!file.subFiles) {
      const destinationPath = destinationUri
        .split('/')
        .slice(0, -1)
        .join('/');
      await RNFS.mkdir(destinationPath);
      await RNFS.copyFile(file.path, destinationUri); // copy sequentially
    } else {
      await RNFS.mkdir(destinationUri);

      // eslint-disable-next-line no-unused-vars
      for (const subFile of file.subFiles) {
        const subFileSourceUri = `${file.path}/${subFile}`;
        const subFileDestinationUri = `${destinationUri}/${subFile}`;
        await RNFS.copyFile(subFileSourceUri, subFileDestinationUri); // copy sequentially
      }
    }
  }
}

export async function storeTilesFromUrl(
  type: LayerType,
  id: string,
  layerUrl: string,
  geostoreId: string,
  zoom: [number, number],
  progressListener: (received: number, total: number) => void
) {
  const url = `${Config.API_URL}/download-tiles/${geostoreId}/${zoom[0]}/${
    zoom[1]
  }?layerUrl=${layerUrl}&useExtension=false`;
  const res = await RNFetchBlob.config({ fileCache: true })
    .fetch('GET', encodeURI(url))
    .progress(progressListener);
  const statusCode = res.info().status;
  if (statusCode >= 200 && statusCode < 400 && res.path()) {
    const downloadPath = res.path();
    const targetPath = pathForLayer(type, id);
    await unzip(downloadPath, targetPath);
    res.flush(); // remove from the cache
    return `${targetPath}/{z}x{x}x{y}`;
  }
  throw new Error(`Fetch blob error ${statusCode}`);
}
