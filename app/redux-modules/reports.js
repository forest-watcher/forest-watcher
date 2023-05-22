// @flow
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import type { BasicReport, ReportsState, ReportsAction, Report, Answer } from 'types/reports.types';

import _ from 'lodash';
import Config from 'react-native-config';
import CONSTANTS from 'config/constants';
import { LOGOUT_REQUEST } from 'redux-modules/user';
import {
  getTemplate,
  isBlobResponse,
  mapFormToAnsweredQuestions,
  REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT
} from 'helpers/forms';
import { GET_AREAS_COMMIT } from 'redux-modules/areas';
import queryReportFiles from 'helpers/report-store/queryReportFiles';
import deleteReportFiles from 'helpers/report-store/deleteReportFiles';
import { toFileUri } from 'helpers/fileURI';
import { shouldBeConnected } from 'helpers/app';
import { storeReportFiles } from 'helpers/report-store/storeReportFiles';
import { Platform } from 'react-native';
import { appDocumentsRootDir } from 'helpers/report-store/reportFilePaths';
import { decreaseAppSynced } from './app';
import { getAssignments } from './assignments';
import { getAudioExtension } from '../helpers/report-store/reportFilePaths';

// Actions
const GET_DEFAULT_TEMPLATE_REQUEST = 'report/GET_DEFAULT_TEMPLATE_REQUEST';
const GET_DEFAULT_TEMPLATE_COMMIT = 'report/GET_DEFAULT_TEMPLATE_COMMIT';
const GET_DEFAULT_TEMPLATE_ROLLBACK = 'report/GET_DEFAULT_TEMPLATE_ROLLBACK';
export const CREATE_REPORT = 'report/CREATE_REPORT';
const UPDATE_REPORT = 'report/UPDATE_REPORT';
const DELETE_REPORT = 'report/DELETE_REPORT';
const UPLOAD_REPORT_REQUEST = 'report/UPLOAD_REPORT_REQUEST';
export const IMPORT_REPORT = 'report/IMPORT_REPORT';
export const IMPORT_TEMPLATE = 'report/IMPORT_TEMPLATE';
export const UPLOAD_REPORT_COMMIT = 'report/UPLOAD_REPORT_COMMIT';
export const UPLOAD_REPORT_ROLLBACK = 'report/UPLOAD_REPORT_ROLLBACK';
const SET_REPORT_ANSWER = 'report/SET_REPORT_ANSWER';
const SET_AS_UPLOADED = 'report/SET_AS_UPLOADED';
const SET_AUDIO_METHOD_DECIDED = 'report/SET_AUDIO_METHOD_DECIDED';

// Reducer
const initialState = {
  templates: {},
  list: {},
  synced: false,
  syncing: false,
  audioMethodDecided: false
};

function orderQuestions(questions) {
  if (!questions || !questions.length) {
    return [];
  }
  return questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
}

export default function reducer(state: ReportsState = initialState, action: ReportsAction) {
  switch (action.type) {
    case GET_DEFAULT_TEMPLATE_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_DEFAULT_TEMPLATE_COMMIT: {
      const template = action.payload || {};
      template.questions = orderQuestions(template.questions);
      const templates = {
        ...state.templates,
        default: template
      };
      return { ...state, templates, synced: true, syncing: false };
    }
    case GET_DEFAULT_TEMPLATE_ROLLBACK:
      return { ...state, syncing: false };
    case GET_AREAS_COMMIT: {
      // Start with all the imported templates plus the default template
      const templates = _.pickBy(state.templates, template => template.isImported);
      if (state.templates.default) {
        templates.default = state.templates.default;
      }

      // Merge in the templates retrieved from the areas
      action.payload.forEach(area => {
        area.reportTemplate?.forEach(template => {
          templates[template.Id] = {
            ...template,
            questions: orderQuestions(template.questions)
          };
        });
      });

      return { ...state, templates };
    }
    case IMPORT_TEMPLATE: {
      const templateId = action.payload.Id;
      if (state.templates[templateId] && !state.templates[templateId].isImported) {
        console.warn('3SC', `Ignore already existing template with ID ${templateId}`);
        return state;
      }
      return {
        ...state,
        templates: {
          ...state.templates,
          [templateId]: action.payload
        }
      };
    }
    case CREATE_REPORT: {
      const { report } = action.payload;
      const list = { ...state.list, [report.reportName]: report };
      return { ...state, list };
    }
    case DELETE_REPORT: {
      const { reportName } = action.payload;
      const list = _.omit(state.list, reportName);
      return { ...state, list };
    }
    case UPDATE_REPORT: {
      const list = { ...state.list };
      list[action.payload.name] = { ...state.list[action.payload.name], ...action.payload.data };
      return { ...state, list };
    }
    case IMPORT_REPORT: {
      const reportToImport = action.payload;
      const reportId = reportToImport.reportName;

      if (state.list[reportId] && !state.list[reportId].isImported) {
        console.warn('3SC', `Ignore already existing report with ID ${reportId}`);
        return state;
      }

      return { ...state, list: { ...state.list, [reportId]: reportToImport } };
    }
    case SET_REPORT_ANSWER: {
      const { reportName, answer, updateOnly } = action.payload;
      const report = state.list[reportName];
      if (!report || !report.answers) {
        return state;
      }
      const answeredIndex = report.answers.findIndex(a => a.questionName === answer.questionName);
      // const template = state.templates[report.area.templateId];
      // const question = template.questions.find(q => (q.name === answer.questionName));
      // const updateValue = question && question.type === 'blob';
      let answers = [...report.answers];

      if (answeredIndex > -1 && updateOnly) {
        answers[answeredIndex] = answer;
      } else {
        if (answeredIndex !== -1) {
          answers = report.answers.slice(0, answeredIndex);
        }
        answers.push(answer);
      }

      const list = {
        ...state.list,
        [reportName]: {
          ...report,
          answers
        }
      };
      return { ...state, list };
    }
    case UPLOAD_REPORT_REQUEST: {
      const { name, status } = action.payload;
      const report = state.list[name];
      const list = { ...state.list, [name]: { ...report, status } };
      return { ...state, list, synced: false, syncing: true };
    }
    case UPLOAD_REPORT_COMMIT: {
      const { name, status } = action.meta.report;
      const report = state.list[name];
      const list = { ...state.list, [name]: { ...report, status } };
      return { ...state, list, synced: true, syncing: false };
    }
    case UPLOAD_REPORT_ROLLBACK: {
      const { name, status } = action.meta.report;
      const report = state.list[name];
      const list = { ...state.list, [name]: { ...report, status } };
      return { ...state, list, synced: true, syncing: false };
    }
    case SET_AS_UPLOADED: {
      let newlist = { ...state.list };
      action.payload.forEach(x => {
        if (newlist[x]) {
          newlist = {
            ...newlist,
            [x]: {
              ...newlist[x],
              status: 'uploaded'
            }
          };
        }
      });

      return {
        ...state,
        list: {
          ...newlist
        }
      };
    }
    case SET_AUDIO_METHOD_DECIDED: {
      return {
        ...state,
        audioMethodDecided: action.payload
      };
    }
    case LOGOUT_REQUEST: {
      deleteReportFiles().then(() => console.info('Folder removed successfully'));
      return initialState;
    }
    default: {
      return state;
    }
  }
}

// Action Creators
export function getDefaultReport(): ReportsAction {
  const url = `${Config.API_URL}/reports/default`;

  return {
    type: GET_DEFAULT_TEMPLATE_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: {
          type: GET_DEFAULT_TEMPLATE_COMMIT,
          meta: {
            then: payload => (dispatch, state) => {
              dispatch(decreaseAppSynced());
            }
          }
        },
        rollback: { type: GET_DEFAULT_TEMPLATE_ROLLBACK }
      }
    }
  };
}

export function createReport(report: BasicReport): ReportsAction {
  const { reportName, userPosition, clickedPosition, area, template } = report;
  return {
    type: CREATE_REPORT,
    payload: {
      report: {
        area,
        reportName,
        userPosition,
        clickedPosition,
        index: 0,
        answers: [],
        date: new Date().getTime(),
        status: CONSTANTS.status.draft,
        template
      }
    }
  };
}

/**
 * In v1 report attachments were referenced as a URI to a file that the app did not directly manage.
 *
 * in v2 we copy report attachments to a particular structure local storage. This helps with app-to-app sharing
 */
export function migrateReportAttachmentsFromV1ToV2(): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState): Promise<void> => {
    const state = getState();
    const appLanguage = state.app.language;
    const reports = Object.keys(state.reports.list).map(key => state.reports.list[key]);
    const templates = state.reports.templates;

    // eslint-disable-next-line no-unused-vars
    for (const report of reports) {
      const template = getTemplate(report, templates);
      const answers = mapFormToAnsweredQuestions(report.answers, template, appLanguage).filter(isBlobResponse);

      // eslint-disable-next-line no-unused-vars
      for (const { question, answer } of answers) {
        const sourceUri = answer.value[0];
        // Check if attachment has already been migrated
        if (!sourceUri || sourceUri === REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT) {
          continue;
        }
        const updatedAnswer = { ...answer };
        try {
          let sourceDir = decodeURI(sourceUri);

          if (Platform.OS === 'ios' && sourceDir.includes('/Documents')) {
            // On iOS, we need to bin anything prior to and including the `/Documents` segment.
            // This is because the app container UUID may have changed, and if we refer to the full
            // path we may not be using the right UUID.
            // We instead need to use the `appDocumentsRootDir` which'll provide the active container UUID.

            const appRelativePath = sourceDir.split('/Documents')[1];
            sourceDir = decodeURI(`${appDocumentsRootDir()}${appRelativePath}`);
          }

          await storeReportFiles([
            {
              reportName: report.reportName,
              questionName: answer.questionName,
              type: 'image/jpeg',
              path: sourceDir,
              size: 0
            }
          ]);
          updatedAnswer.value = REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT;
        } catch (err) {
          updatedAnswer.value = null;
          console.warn('3SC', `Could not migrate report attachment from ${sourceUri}`);
        } finally {
          dispatch(setReportAnswer(report.reportName, updatedAnswer, true));
        }
      }
    }
  };
}

export function setReportAnswer(reportName: string, answer: Answer, updateOnly: boolean = false): ReportsAction {
  return {
    type: SET_REPORT_ANSWER,
    payload: {
      reportName,
      answer,
      updateOnly
    }
  };
}

export function deleteReport(reportName: string): ReportsAction {
  deleteReportFiles({
    reportName
  });
  return {
    type: DELETE_REPORT,
    payload: { reportName }
  };
}

export function saveReport(name: string, data: Report): ReportsAction {
  return {
    type: UPDATE_REPORT,
    payload: { name, data }
  };
}

export function uploadReport(reportName: string) {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    const { user = {}, reports, app } = state;
    const report = reports.list[reportName];

    const isConnected = shouldBeConnected(state);
    if (!isConnected) {
      console.warn('3SC', 'Not attempting to upload report while offline');
      dispatch(
        saveReport(reportName, {
          ...report,
          status: CONSTANTS.status.complete
        })
      );
      return;
    }

    const userName = (user.data && user.data.fullName) || '';
    const organization = (user.data && user.data.organization) || '';
    const language = app.language || '';
    const area = report.area;
    const dataset = area.dataset || {};
    const template = report.template || getTemplate(report, reports.templates);
    const form = new FormData();
    form.append('report', template.Id || template.id);
    form.append('reportName', reportName);
    form.append('areaOfInterest', area.id);
    form.append('areaOfInterestName', area.name);
    form.append('startDate', dataset.startDate);
    form.append('endDate', dataset.endDate);
    form.append('layer', dataset.slug);
    form.append('language', language);
    form.append('username', userName);
    form.append('organization', organization);
    form.append('date', report && report.date);
    form.append('clickedPosition', report && report.clickedPosition);
    form.append('userPosition', report && report.userPosition);
    if (area.teamId) {
      form.append('teamId', area.teamId);
    }
    if (template.assignmentId) {
      form.append('assignmentId', template.assignmentId);
    }

    const answeredQuestions = mapFormToAnsweredQuestions(report.answers, template, null);
    // eslint-disable-next-line no-unused-vars
    for (const { question, answer } of answeredQuestions) {
      if (question.type === 'blob') {
        const reportFiles = await queryReportFiles({
          reportName: reportName,
          questionName: question.name
        });
        reportFiles.forEach(reportFile =>
          form.append(question.name, {
            uri: toFileUri(reportFile.path),
            type: 'image/jpg',
            name: `${reportName}-image-${question.name}.jpg`
          })
        );
      } else if (question.type === 'audio') {
        const reportFiles = await queryReportFiles({
          reportName: reportName,
          questionName: question.name
        });
        reportFiles.forEach(reportFile =>
          form.append(question.name, {
            uri: toFileUri(reportFile.path),
            type: `audio/${getAudioExtension()}`,
            name: `${reportName}-audio-${question.name}.${getAudioExtension()}`
          })
        );
      } else {
        form.append(question.name, answer.value.toString());
      }
    }

    const requestPayload = {
      name: reportName,
      status: CONSTANTS.status.complete,
      alerts: JSON.parse(report.clickedPosition)
    };
    const commitPayload = {
      name: reportName,
      status: CONSTANTS.status.uploaded
    };
    const rollbackPayload = {
      name: reportName,
      status: CONSTANTS.status.complete
    };
    const url = `${Config.API_V3_URL}/templates/${template.Id || template.id}/answers`;
    const headers = { 'content-type': 'multipart/form-data' };
    dispatch({
      type: UPLOAD_REPORT_REQUEST,
      payload: requestPayload,
      meta: {
        offline: {
          effect: { url, body: form, method: 'POST', headers, errorCode: 400 },
          commit: {
            type: UPLOAD_REPORT_COMMIT,
            meta: {
              report: commitPayload,
              then: payload => (dispatch, state) => {
                if (template.assignmentId) {
                  dispatch(getAssignments());
                }
              }
            }
          },
          rollback: { type: UPLOAD_REPORT_ROLLBACK, meta: { report: rollbackPayload } }
        }
      }
    });
  };
}

export function setAsUploaded(reportIds: Array<string>) {
  return (dispatch: Dispatch, state: GetState) => {
    dispatch({
      type: SET_AS_UPLOADED,
      payload: reportIds
    });
  };
}

export function setAsUploadedAll() {
  return (dispatch: Dispatch, state: GetState) => {
    const { reports } = state();
    const completed = Object.keys(reports.list)
      .map(x => reports.list[x])
      .filter(x => x.status === 'complete');
    dispatch({
      type: SET_AS_UPLOADED,
      payload: completed.map(x => x.reportName)
    });
  };
}

export function setAudioMethodDecided(decided: boolean) {
  return (dispatch: Dispatch, state: GetState) => {
    dispatch({
      type: SET_AUDIO_METHOD_DECIDED,
      payload: decided
    });
  };
}

export function syncReports() {
  return (dispatch: Dispatch, state: GetState) => {
    const { reports } = state();
    if (!reports.synced && !reports.syncing) {
      dispatch(getDefaultReport());
    }
  };
}
