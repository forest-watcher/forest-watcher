// @flow

import type { LayerFile } from 'types/sharing.types';
import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import {
  fileNameForTile,
  layerRootDir,
  type LayerType,
  pathForLayer,
  pathForLayerFile
} from 'helpers/layer-store/layerFilePaths';
import tilebelt from '@mapbox/tilebelt';
import turfBbox from '@turf/bbox';
import { GeoJSONObject } from '@turf/helpers';
import { writeJSONToDisk } from 'helpers/fileManagement';
import { cleanGeoJSON } from 'helpers/map';

const RNFS = require('react-native-fs');

/**
 * Store the specified geojson object into the layer store.
 *
 * // TODO: Split FeatureCollection and GeometryCollection into their constituent parts and store each part separately
 */
export async function storeGeoJson(layerId: string, geojson: GeoJSONObject, name: string = 'data'): Promise<LayerFile> {
  const cleanedGeoJson = cleanGeoJSON(geojson);
  const rootPath = pathForLayer('contextual_layer', layerId);
  const bbox = turfBbox(cleanedGeoJson);
  const tileXYZ = tilebelt.bboxToTile(bbox);
  const tileDir = fileNameForTile(tileXYZ);
  const path = `${rootPath}/${tileDir}`;
  const fileName = `${name}.geojson`;
  await writeJSONToDisk(cleanedGeoJson, fileName, path);
  try {
    const result = await RNFS.readDir(path);
    let size = '0';
    if (result.length) {
      size = result[0].size;
    }
    const sizeNumber = parseInt(size);
    return {
      path: path,
      type: 'contextual_layer',
      layerId: layerId,
      tileXYZ: tileXYZ,
      subFiles: [fileName],
      size: isNaN(sizeNumber) ? 0 : sizeNumber
    };
  } catch {
    return {
      path: path,
      type: 'contextual_layer',
      layerId: layerId,
      tileXYZ: tileXYZ,
      subFiles: [fileName],
      size: 0
    };
  }
}

export async function storeLayerFiles(files: Array<LayerFile>, dir: string = layerRootDir()) {
  // eslint-disable-next-line no-unused-vars
  for (const file of files) {
    const destinationUri = pathForLayerFile(file, dir);

    const subFiles = file.subFiles;
    if (!subFiles) {
      const destinationPath = destinationUri
        .split('/')
        .slice(0, -1)
        .join('/');
      await RNFS.mkdir(destinationPath);
      await RNFS.copyFile(file.path, destinationUri); // copy sequentially
    } else {
      await RNFS.mkdir(destinationUri);

      // eslint-disable-next-line no-unused-vars
      for (const subFile of subFiles) {
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
