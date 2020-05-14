// @flow

import type { LayerFile, ReportFile, SharingBundleManifest } from 'types/sharing.types';

/**
 * Returns a rough approximation of the export file size for a given export layer manifest
 */
export default function manifestBundleSize(manifest: SharingBundleManifest): number {
  let size = 0;
  manifest.layerFiles.forEach((file: LayerFile) => {
    if (!isNaN(file.size)) {
      size += file.size;
    }
  });
  manifest.reportFiles.forEach((file: ReportFile) => {
    if (!isNaN(file.size)) {
      size += file.size;
    }
  });
  return size + 1024;
}
