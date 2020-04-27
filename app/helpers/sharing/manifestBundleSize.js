// @flow

import type { LayerManifest } from 'types/sharing.types';

/** 
 * Returns a rough approximation of the export file size for a given export layer manifest
 */
export default function manifestBundleSize(
    manifest: LayerManifest
): number {
  let size = 0;
  Object.values({...manifest.basemaps, ...manifest.layers}).forEach(file => {
    if (!!file.filesize) {
      const fileSize = parseInt(file.filesize);
      if (!isNaN(fileSize)) {
        size += fileSize;
      }
    }
  });
  return size;
} 
