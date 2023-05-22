// @flow

import type { ReportFile } from 'types/sharing.types';
import CONSTANTS from 'config/constants';
import { Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

export type ReportAttachmentType = 'image/jpeg' | 'audio/mp4' | 'audio/m4a'; // more to be added here when we support audio etc.

export function appDocumentsRootDir() {
  return RNFetchBlob.fs.dirs.DocumentDir;
}

export function reportRootDir() {
  return `${RNFetchBlob.fs.dirs.DocumentDir}/${CONSTANTS.files.reports}`;
}

export function attachmentForFileName(fileName: string): ReportAttachmentType {
  if (fileName.endsWith('.mp4')) {
    return 'audio/mp4';
  } else if (fileName.endsWith('.m4a')) {
    return 'audio/m4a';
  } else {
    return 'image/jpeg';
  }
}

/**
 * Different types of report attachments are stored using different file names, within a directory structure where they
 * are grouped by the report and question they belong to (see other functions in this file).
 *
 * For now, only image attachments are supported, but we have written these functions generally so that other attachments
 * can be supported in future (e.g. audio)
 */
function fileNameForAttachment(type: ReportAttachmentType, index?: number): string {
  switch (type) {
    case 'image/jpeg': {
      if (index !== undefined) {
        return `attachment_${index}.jpeg`;
      }
      return 'attachment.jpeg';
    }
    case 'audio/mp4': {
      return `attachment_audio.mp4`;
    }
    case 'audio/m4a': {
      return `attachment_audio.m4a`;
    }
    default: {
      // This case is a placeholder for future attachment types - Flow will flag if we omit one
      // eslint-disable-next-line babel/no-unused-expressions
      (type: empty);
      throw new Error('Unsupported attachment type: ' + type);
    }
  }
}

export function getAudioExtension(): 'mp4' | 'm4a' {
  return Platform.OS === 'android' ? 'mp4' : 'm4a';
}

/**
 * Report attachments are stored in a structure where they are grouped by the report they belong to and then within that
 * by the question they belong to. This function takes a report name and returns the first part of that dir structure
 */
export function pathForReport(reportName: string, dir: string = reportRootDir()): string {
  // Encode components so we don't inadvertently end up with invalid chars in the dir name
  // However the returned path is intended as a raw path and should still be encoded for code that requires encoded paths
  return `${dir}/${encodeURIComponent(reportName)}`;
}

/**
 * Report attachments are stored in a structure where they are grouped by the report they belong to and then within that
 * by the question they belong to. This function takes a report and question name and returns the correct dir structure
 */
export function pathForReportQuestion(reportName: string, questionName: string, dir: string = reportRootDir()): string {
  const path = pathForReport(reportName, dir);
  // Encode components so we don't inadvertently end up with invalid chars in the dir name
  // However the returned path is intended as a raw path and should still be encoded for code that requires encoded paths
  return `${path}/${encodeURIComponent(questionName)}`;
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
  dir: string = reportRootDir(),
  index?: number
): string {
  const path = pathForReportQuestion(reportName, questionName, dir);
  const fileName = fileNameForAttachment(attachmentType, index);
  return `${path}/${fileName}`;
}

/**
 * Uses the metadata in the specified file to return the path this file should be stored in under the specified root
 */
export function pathForReportFile(file: ReportFile, dir: string = reportRootDir()): string {
  return pathForReportQuestionAttachment(file.reportName, file.questionName, file.type, dir, file.index);
}

/**
 * Get all attachments for an answer
 */
export function listAnswerAttachments(
  reportName: string,
  questionName: string,
  attachmentType: ReportAttachmentType,
  indexes: Array<any>,
  dir: string = reportRootDir()
): Array<string> {
  const path = pathForReportQuestion(reportName, questionName, dir);
  return indexes.map(x => `${path}/${fileNameForAttachment(attachmentType, x.index)}`);
}

/**
 * Delete a report attachment
 */
export async function deleteReportFile(
  reportName: string,
  questionName: string,
  attachmentType: ReportAttachmentType,
  index: number,
  dir: string = reportRootDir()
) {
  const path = pathForReportQuestion(reportName, questionName, dir);
  const file = `${path}/${fileNameForAttachment(attachmentType, index)}`;
  await RNFetchBlob.fs.unlink(file);
}
