// @flow

import { layerRootDir } from 'helpers/layer-store/layerFilePaths';

const RNFS = require('react-native-fs');

export default async function deleteLayerFiles(): Promise<void> {
  await RNFS.unlink(layerRootDir());
}
