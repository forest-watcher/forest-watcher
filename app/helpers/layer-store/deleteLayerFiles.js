// @flow
import { layerRootDir } from 'helpers/layer-store/layerFilePaths';
import queryLayerFiles from 'helpers/layer-store/queryLayerFiles';

// $FlowFixMe
const RNFS = require('react-native-fs');

export async function deleteLayerFile(fileId: string, type: string) {
  const files = await queryLayerFiles(type, {
    whitelist: [fileId],
    blacklist: []
  });

  if (files && files.length > 0) {
    await RNFS.unlink(files[0].path);
  }
}

export default async function deleteLayerFiles(): Promise<void> {
  await RNFS.unlink(layerRootDir());
}
