// @flow

import type { LayerFile, ReportFile, UnpackedSharingBundle } from 'types/sharing.types';
import { storeLayerFiles } from 'helpers/layer-store/storeLayerFiles';
import { storeReportFiles } from 'helpers/report-store/storeReportFiles';

export default async function importFileManifest(bundle: UnpackedSharingBundle) {
  await importLayerFiles(bundle.data.manifest.layerFiles, bundle.path);
  await importReportFiles(bundle.data.manifest.reportFiles, bundle.path);
}

async function importLayerFiles(layerFiles: Array<LayerFile>, importPath: string) {
  const unpackedLayerFiles = layerFiles.map(layerFile => ({
    ...layerFile,
    path: `${importPath}${layerFile.path}`
  }));
  await storeLayerFiles(unpackedLayerFiles);
}

async function importReportFiles(reportFiles: Array<ReportFile>, importPath: string) {
  const unpackedReportFiles = reportFiles.map(reportFile => ({
    ...reportFile,
    path: `${importPath}${reportFile.path}`
  }));
  await storeReportFiles(unpackedReportFiles);
}
