// @flow
import type { Area, GetAreasCommit } from 'types/areas.types';
import type { LogoutRequest } from 'types/user.types';
import type { OfflineMeta } from 'types/offline.types';

export type Question = {
  type: string,
  name: string,
  Id: string,
  conditions: Array<any>,
  childQuestions: Array<Question>,
  childQuestion: Question,
  defaultValue: string,
  values?: Array<any>,
  order: number,
  required: boolean,
  label: { [string]: string },
}

export type Answer = {
  questionName: string,
  value: any,
  child?: ?Answer
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

export type Report = {
  name: string,
  area: Area,
  userPosition: string,
  clickedPosition: string,
  index: number,
  status: 'draft' | 'complete' | 'uploaded',
  date: string,
  answers: Array<Answer>
};

export type ReportsState = {
  templates: {
    [string]: Template
  },
  list: {
    [string]: Report
  },
  synced: boolean,
  syncing: boolean
}

export type GetDefaultTemplateRequest = { type: 'report/GET_DEFAULT_TEMPLATE_REQUEST' };
export type GetDefaultTemplateCommit = { type: 'report/GET_DEFAULT_TEMPLATE_COMMIT', payload: Template };
export type GetDefaultTemplateRollback = { type: 'report/GET_DEFAULT_TEMPLATE_ROLLBACK' };

export type CreateReport = {
  type: 'report/CREATE_REPORT',
  payload: {
    [string]: Report
  };
};
export type DeleteReport = { type: 'report/DELETE_REPORT', payload: { reportName: string } };
export type UpdateReport = { type: 'report/UPDATE_REPORT', payload: { name: string, data: Report } };
export type SetReportAnswer = { type: 'report/SET_REPORT_ANSWER', payload: { reportName: string, answer: Answer, updateOnly?: boolean } };

export type UploadReportRequest = {
  type: 'report/UPLOAD_REPORT_REQUEST',
  payload: {
    name: string,
    status: 'complete',
    alerts: Array<{ lon: number, lat: number}>
  },
  meta: OfflineMeta
};
export type UploadReportCommit = {
  type: 'report/UPLOAD_REPORT_COMMIT',
  meta: {
    report: {
      name: string,
      status: 'uploaded'
    }
  }
};

export type UploadReportRollback = {
  type: 'report/UPLOAD_REPORT_ROLLBACK',
  meta: {
    report: {
      name: string,
      status: 'complete'
    }
  }
};

export type ReportsAction =
  | GetAreasCommit
  | GetDefaultTemplateRequest
  | GetDefaultTemplateCommit
  | GetDefaultTemplateRollback
  | CreateReport
  | DeleteReport
  | UpdateReport
  | UploadReportRequest
  | UploadReportCommit
  | UploadReportRollback
  | SetReportAnswer
  | LogoutRequest;
