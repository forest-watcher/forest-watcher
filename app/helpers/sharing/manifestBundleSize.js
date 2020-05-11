// @flow

import type { LayerFile, LayerManifest } from 'types/sharing.types';

/**
 * Returns a rough approximation of the export file size for a given export layer manifest
 */
export default function manifestBundleSize(manifest: LayerManifest): number {
  let size = 0;
  const basemapFiles: Array<LayerFile> = Object.keys(manifest.basemaps)
    .map(key => manifest.basemaps[key])
    .flatMap(element => {
      return element;
    });
  const layerFiles: Array<LayerFile> = Object.keys(manifest.layers)
    .map(key => manifest.layers[key])
    .flatMap(element => {
      return element;
    });

  const allFiles = basemapFiles.concat(layerFiles);

  allFiles.forEach((file: LayerFile) => {
    if (file.filesize) {
      const fileSize = parseInt(file.filesize);
      if (!isNaN(fileSize)) {
        size += fileSize;
      }
    }
  });

  return size;
}
