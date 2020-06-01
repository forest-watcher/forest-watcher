// @flow

import type { ReportFile } from 'types/sharing.types';
import { attachmentForFileName, pathForReport, pathForReportQuestion } from 'helpers/report-store/reportFilePaths';

import RNFetchBlob, { type RNFetchBlobStat } from 'rn-fetch-blob';

export type ReportFileQuery = {|
  reportName: string,
  questionName?: string
|};

/**
 * Returns all report files meeting the following conditions:
 *
 * (i) Must belong to the report with the specified name
 * (ii) Must belong to the question with the specified name
 */
export default async function queryReportFiles(query: ReportFileQuery): Promise<Array<ReportFile>> {
  if (!query.questionName) {
    const questionsForReport = await listReportQuestions(query.reportName);
    const reportFiles = [];
    // eslint-disable-next-line no-unused-vars
    for (const questionName of questionsForReport) {
      const questionFiles = await queryReportFiles({
        reportName: query.reportName,
        questionName
      });
      reportFiles.push(...questionFiles);
    }
    return reportFiles;
  }

  const path = pathForReportQuestion(query.reportName, query.questionName);
  const pathExists = await RNFetchBlob.fs.exists(path);

  if (!pathExists) {
    return [];
  }

  const childFiles: Array<RNFetchBlobStat> = await RNFetchBlob.fs.lstat(path);

  return childFiles.map(file => ({
    reportName: query.reportName,
    questionName: query.questionName,
    path: file.path,
    size: parseInt(file.size),
    type: attachmentForFileName(file.filename)
  }));
}

/**
 * Lists the IDs of all the layers stored on disk of a certain type
 */
async function listReportQuestions(reportName: string): Promise<Array<string>> {
  const path = pathForReport(reportName);
  // Check exists, otherwise the readDir throws on iOS
  const exists = await RNFetchBlob.fs.exists(path);
  if (!exists) {
    return [];
  }
  const children: Array<RNFetchBlobStat> = await RNFetchBlob.fs.lstat(path);
  return children.filter(child => child.type === 'directory').map(dir => dir.filename);
}
