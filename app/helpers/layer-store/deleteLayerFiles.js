// @flow
import type { LayerType } from 'types/sharing.types';
import { layerRootDir, pathForLayer } from 'helpers/layer-store/layerFilePaths';

const RNFS = require('react-native-fs');

export async function deleteLayerFile(fileId: string, type: LayerType) {
  try {
    const path = pathForLayer(type, fileId);
    await RNFS.unlink(path);
  } catch (error) {
    console.warn(error);
  }
}

export default async function deleteLayerFiles(): Promise<void> {
  await RNFS.unlink(layerRootDir());
}
