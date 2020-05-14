// @flow

import type { UnpackedSharingBundle } from 'types/sharing.types';
import { storeLayerFiles } from 'helpers/layer-store/storeLayerFiles';

export default async function importFileManifest(bundle: UnpackedSharingBundle) {
  const unpackedLayerFiles = bundle.data.manifest.layerFiles.map(layerFile => ({
    ...layerFile,
    path: `${bundle.path}${layerFile.path}`
  }));
  console.log('3SC', 'Unpacked laeyr files', unpackedLayerFiles);
  await storeLayerFiles(unpackedLayerFiles);
}
