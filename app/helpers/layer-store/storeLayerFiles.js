// @flow

import Config from 'react-native-config';
import RNFetchBlob from 'rn-fetch-blob';
import { unzip } from 'react-native-zip-archive';
import { type LayerType, pathForLayer } from 'helpers/layer-store/layerFilePaths';

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
