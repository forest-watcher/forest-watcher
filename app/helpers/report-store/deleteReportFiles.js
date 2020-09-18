// @flow

import type { ReportFileQuery } from 'helpers/report-store/queryReportFiles';
import { pathForReport, pathForReportQuestion, reportRootDir } from 'helpers/report-store/reportFilePaths';

import RNFetchBlob from 'rn-fetch-blob';

export default async function deleteReportFiles(query: ?ReportFileQuery): Promise<void> {
  const path = !query
    ? reportRootDir()
    : query.questionName
    ? pathForReportQuestion(query.reportName, query.questionName)
    : pathForReport(query.reportName);
  try {
    await RNFetchBlob.fs.unlink(path);
  } catch (err) {
    console.warn('3SC', `Could not delete report files in ${path}`, err);
  }
}
