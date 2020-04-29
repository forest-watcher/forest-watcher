// @flow

import type { LayerManifest } from 'types/sharing.types';

/**
 * Returns a rough approximation of the export file size for a given export layer manifest
 */
export default function manifestBundleSize(manifest: LayerManifest): number {
  let size = 0;
  const basemapFiles = Object.values(manifest.basemaps).flatMap(element => {
    return element;
  });
  const layerFiles = Object.values(manifest.layers).flatMap(element => {
    return element;
  });
  const allFiles = basemapFiles.concat(layerFiles);
  allFiles.forEach(file => {
    if (file.filesize) {
      const fileSize = parseInt(file.filesize);
      if (!isNaN(fileSize)) {
        size += fileSize;
      }
    }
  });
  return size;
}
