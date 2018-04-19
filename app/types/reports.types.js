// @flow
import type { GetAreasCommit } from 'types/areas.types';
import type { LogoutRequest } from 'types/user.types';

export type Question = {
  type: string,
  name: string,
  Id: string,
  conditions: Array<any>,
  childQuestions: Array<any>,
  values?: Array<any>,
  order: number,
  required: boolean,
  label: { [string]: string },
}

export type Template = {
  name: {
    [string]: Object
  },
  languages: Array<string>,
  defaultLanguage: string,
  user: string,
  answersCount: number,
  questions: Array<Question>,
  createdAt: string,
  public: boolean,
  status: 'unpublished' | 'published',
  id: string
}

export type ReportsState = {
  templates: Object,
  list: {
    [string]: Report
  },
  synced: boolean,
  syncing: boolean
}

export type Report = Object;

export type GetDefaultTemplateRequest = { type: 'report/GET_DEFAULT_TEMPLATE_REQUEST' };
export type GetDefaultTemplateCommit = { type: 'report/GET_DEFAULT_TEMPLATE_COMMIT', payload: Template };
export type GetDefaultTemplateRollback = { type: 'report/GET_DEFAULT_TEMPLATE_ROLLBACK' };

export type CreateReport = { type: 'report/CREATE_REPORT' };
export type UpdateReport = { type: 'report/UPDATE_REPORT', payload: { name: string, data: Report } };
export type UploadReportRequest = { type: 'report/UPLOAD_REPORT_REQUEST' };
export type UploadReportCommit = { type: 'report/UPLOAD_REPORT_COMMIT' };
export type UploadReportRollback = { type: 'report/UPLOAD_REPORT_ROLLBACK' };

export type ReportsAction =
  | GetAreasCommit
  | GetDefaultTemplateRequest
  | GetDefaultTemplateCommit
  | GetDefaultTemplateRollback
  | LogoutRequest;
