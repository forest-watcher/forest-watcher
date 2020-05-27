// @flow

import type { ReportFile } from 'types/sharing.types';
import CONSTANTS from 'config/constants';
import RNFetchBlob from 'rn-fetch-blob';

export type ReportAttachmentType = 'image/jpeg'; // more to be added here when we support audio etc.

export function reportRootDir() {
  return `${RNFetchBlob.fs.dirs.DocumentDir}/${CONSTANTS.files.reports}`;
}

export function attachmentForFileName(fileName: string): ReportAttachmentType {
  return 'image/jpeg';
}

export function fileNameForAttachment(type: ReportAttachmentType): string {
  switch (type) {
    case 'image/jpeg': {
      return 'attachment.jpeg';
    }
    default: {
      // This case is a placeholder for future attachment types - Flow will flag if we omit one
      // eslint-disable-next-line babel/no-unused-expressions
      (type: empty);
      throw new Error('Unsupported attachment type: ' + type);
    }
  }
}

export function pathForReport(reportName: string, dir: string = reportRootDir()): string {
  return `${dir}/${reportName}`;
}

export function pathForReportQuestion(reportName: string, questionName: string, dir: string = reportRootDir()): string {
  const path = pathForReport(reportName, dir);
  return `${path}/${questionName}`;
}

export function pathForReportQuestionAttachment(
  reportName: string,
  questionName: string,
  attachmentType: ReportAttachmentType,
  dir: string = reportRootDir()
): string {
  const path = pathForReportQuestion(reportName, questionName, dir);
  const fileName = fileNameForAttachment(attachmentType);
  return `${path}/${fileName}`;
}

export function pathForReportFile(file: ReportFile, dir: string = reportRootDir()): string {
  return pathForReportQuestionAttachment(file.reportName, file.questionName, file.type, dir);
}
