// @flow

import type { ReportFile } from 'types/sharing.types';
import { pathForReportFile, reportRootDir } from 'helpers/report-store/reportFilePaths';
import { copyFileWithReplacement } from 'helpers/fileManagement';

export async function storeReportFiles(files: Array<ReportFile>, outputPath: string = reportRootDir()) {
  // eslint-disable-next-line no-unused-vars
  for (const file of files) {
    try {
      if (!file.index) {
        // Extract file index and attach to file
        const attachmentIndex = getNumberFromFileName(file.path, getFileExtension(file.path));
        if (attachmentIndex) {
          file.index = Number(attachmentIndex);
        }
      }

      const sourceUri = file.path;
      const destinationUri = pathForReportFile(file, outputPath);
      await copyFileWithReplacement(sourceUri, destinationUri);
    } catch (err) {
      console.warn('3SC', `Failed to store report attachment (${file.reportName}, ${file.questionName})`, err);
    }
  }
}

function getNumberFromFileName(filePath, fileExtension) {
  if (fileExtension) {
    // eslint-disable-next-line
    const regexPattern = new RegExp(`(?:^|\/)attachment_(\\d+)\\.${fileExtension}$`);
    const match = filePath.match(regexPattern);
    return match ? match[1] : null;
  }
  return null;
}

function getFileExtension(filePath) {
  const match = filePath.match(/\.([^.]+)$/);
  return match ? match[1] : null;
}
