// @flow

import type { ReportFile } from 'types/sharing.types';
import { pathForReportFile, reportRootDir } from 'helpers/report-store/reportFilePaths';
import { copyFile } from 'helpers/fileManagement';

export async function storeReportFiles(files: Array<ReportFile>, outputPath: string = reportRootDir()) {
  // eslint-disable-next-line no-unused-vars
  for (const file of files) {
    try {
      const sourceUri = file.path;
      const destinationUri = pathForReportFile(file, outputPath);
      await copyFile(sourceUri, destinationUri);
    } catch (err) {
      console.warn('3SC', `Failed to store report attachment (${file.reportName}, ${file.questionName})`, err);
    }
  }
}
