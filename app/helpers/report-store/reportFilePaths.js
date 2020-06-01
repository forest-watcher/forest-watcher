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

/**
 * Different types of report attachments are stored using different file names, within a directory structure where they
 * are grouped by the report and question they belong to (see other functions in this file).
 *
 * For now, only image attachments are supported, but we have written these functions generally so that other attachments
 * can be supported in future (e.g. audio)
 */
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

/**
 * Report attachments are stored in a structure where they are grouped by the report they belong to and then within that
 * by the question they belong to. This function takes a report name and returns the first part of that dir structure
 */
export function pathForReport(reportName: string, dir: string = reportRootDir()): string {
  return `${dir}/${reportName}`;
}

/**
 * Report attachments are stored in a structure where they are grouped by the report they belong to and then within that
 * by the question they belong to. This function takes a report and question name and returns the correct dir structure
 */
export function pathForReportQuestion(reportName: string, questionName: string, dir: string = reportRootDir()): string {
  const path = pathForReport(reportName, dir);
  return `${path}/${questionName}`;
}

/**
 * Report attachments are stored in a structure where they are grouped by the report they belong to and then within that
 * by the question they belong to.
 *
 * Different types of attachment (images, audio etc.) are then stored as files within this structure.
 *
 * This means that given a report and question name, and the type of attachment, we can return the path the attachment
 * should be stored in.
 */
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

/**
 * Uses the metadata in the specified file to return the path this file should be stored in under the specified root
 */
export function pathForReportFile(file: ReportFile, dir: string = reportRootDir()): string {
  return pathForReportQuestionAttachment(file.reportName, file.questionName, file.type, dir);
}
