// @flow

import type { LayerFile, LayerType } from 'types/sharing.types';
import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import { fileNameForTile, layerRootDir, pathForLayer, pathForLayerFile } from 'helpers/layer-store/layerFilePaths';
import tilebelt from '@mapbox/tilebelt';
import turfBbox from '@turf/bbox';
import { GeoJSONObject } from '@turf/helpers';
import { writeFileWithReplacement, writeJSONToDisk } from 'helpers/fileManagement';
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

  let size;

  try {
    const result = await RNFS.readDir(path);
    let fileSize;
    if (result.length) {
      fileSize = result[0].size;
    }
    size = parseInt(fileSize);
  } catch {
    console.warn('Failed to get GeoJSON file size');
  }

  return {
    path: path,
    type: 'contextual_layer',
    layerId: layerId,
    tileXYZ: tileXYZ,
    subFiles: [fileName],
    size: isNaN(size) ? 0 : size
  };
}

export async function storeLayerFiles(
  files: Array<LayerFile>,
  method: 'copy' | 'move' = 'copy',
  dir: string = layerRootDir()
) {
  // eslint-disable-next-line no-unused-vars
  for (const file of files) {
    const destinationUri = pathForLayerFile(file, dir);

    const subFiles = file.subFiles;
    if (!subFiles) {
      await writeFileWithReplacement(file.path, destinationUri, method); // write each file sequentially
    } else {
      // eslint-disable-next-line no-unused-vars
      for (const subFile of subFiles) {
        const subFileSourceUri = `${file.path}/${subFile}`;
        const subFileDestinationUri = `${destinationUri}/${subFile}`;
        await writeFileWithReplacement(subFileSourceUri, subFileDestinationUri, method); // write each file sequentially
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
  const url = `${Config.API_VIZZUALITY_URL}/download-tiles/${geostoreId}/${zoom[0]}/${
    zoom[1]
  }?layerUrl=${layerUrl}&useExtension=false`;
  const res = await RNFetchBlob.config({ fileCache: true })
    .fetch('GET', encodeURI(url))
    .progress(progressListener);

  const statusCode = res.info().status;
  const data = await res.json();
  console.log('store tiles from url: result', JSON.stringify(data), url);
  if (statusCode >= 200 && statusCode < 400 && res.path()) {
    const downloadPath = res.path();
    const targetPath = pathForLayer(type, id);
    await unzip(downloadPath, targetPath);
    res.flush(); // remove from the cache
    return `${targetPath}/{z}x{x}x{y}`;
  }
  throw new Error(`Fetch blob error ${statusCode}`);
}
