// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { BasicReport, ReportsState, ReportsAction, Report, Answer } from 'types/reports.types';

import _ from 'lodash';
import Config from 'react-native-config';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';
import CONSTANTS from 'config/constants';
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { getTemplate, mapFormToAnsweredQuestions } from 'helpers/forms';
import { GET_AREAS_COMMIT } from 'redux-modules/areas';
import { CREATE_REPORT } from 'redux-modules/shared';
import queryReportFiles from 'helpers/report-store/queryReportFiles';
import deleteReportFiles from 'helpers/report-store/deleteReportFiles';
import { toFileUri } from 'helpers/fileURI';
import { shouldBeConnected } from 'helpers/app';

// Actions
const GET_DEFAULT_TEMPLATE_REQUEST = 'report/GET_DEFAULT_TEMPLATE_REQUEST';
const GET_DEFAULT_TEMPLATE_COMMIT = 'report/GET_DEFAULT_TEMPLATE_COMMIT';
const GET_DEFAULT_TEMPLATE_ROLLBACK = 'report/GET_DEFAULT_TEMPLATE_ROLLBACK';
const UPDATE_REPORT = 'report/UPDATE_REPORT';
const DELETE_REPORT = 'report/DELETE_REPORT';
const UPLOAD_REPORT_REQUEST = 'report/UPLOAD_REPORT_REQUEST';
export const IMPORT_REPORT = 'report/IMPORT_REPORT';
export const IMPORT_TEMPLATE = 'report/IMPORT_TEMPLATE';
export const UPLOAD_REPORT_COMMIT = 'report/UPLOAD_REPORT_COMMIT';
export const UPLOAD_REPORT_ROLLBACK = 'report/UPLOAD_REPORT_ROLLBACK';
const SET_REPORT_ANSWER = 'report/SET_REPORT_ANSWER';

// Reducer
const initialState = {
  templates: {},
  list: {},
  synced: false,
  syncing: false
};

function orderQuestions(questions) {
  if (!questions || !questions.length) {
    return [];
  }
  return questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
}

export default function reducer(state: ReportsState = initialState, action: ReportsAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { reports = state, form } = action.payload;
      if (form && !form.migrated) {
        const formatAnswers = values =>
          Object.entries(values).map(([questionName, value]) => ({ questionName, value, child: null }));
        const answers = Object.entries(form || {}).reduce(
          (acc, [reportName, formEntry]) => ({
            ...acc,
            [reportName]: {
              reportName,
              answers: formatAnswers(formEntry.values || {})
            }
          }),
          {}
        );
        return { ...reports, list: _.merge(answers, reports.list) };
      }
      return reports;
    }
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
      action.payload
        .map(area => area.reportTemplate)
        .filter(Boolean)
        .forEach(template => {
          templates[template.id] = {
            ...template,
            questions: orderQuestions(template.questions)
          };
        });

      return { ...state, templates };
    }
    case IMPORT_TEMPLATE: {
      const templateId = action.payload.id;
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
function getDefaultReport(): ReportsAction {
  const url = `${Config.API_URL}/reports/default`;

  return {
    type: GET_DEFAULT_TEMPLATE_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: { type: GET_DEFAULT_TEMPLATE_COMMIT },
        rollback: { type: GET_DEFAULT_TEMPLATE_ROLLBACK }
      }
    }
  };
}

export function createReport(report: BasicReport): ReportsAction {
  const { reportName, userPosition, clickedPosition, area, selectedAlerts } = report;
  return {
    type: CREATE_REPORT,
    payload: {
      selectedAlerts,
      report: {
        area,
        reportName,
        userPosition,
        clickedPosition,
        index: 0,
        answers: [],
        date: new Date().toISOString(),
        status: CONSTANTS.status.draft
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

    const isConnected = shouldBeConnected(state);
    if (!isConnected) {
      console.warn('3SC', 'Not attempting to upload report while offline');
      return;
    }

    const { user = {}, reports, app } = state;
    const report = reports.list[reportName];
    const userName = (user.data && user.data.fullName) || '';
    const organization = (user.data && user.data.organization) || '';
    const language = app.language || '';
    const area = report.area;
    const dataset = area.dataset || {};
    const template = getTemplate(report, reports.templates);

    const form = new FormData();
    form.append('report', template.id);
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
    const url = `${Config.API_URL}/reports/${template.id}/answers`;
    const headers = { 'content-type': 'multipart/form-data' };
    dispatch({
      type: UPLOAD_REPORT_REQUEST,
      payload: requestPayload,
      meta: {
        offline: {
          effect: { url, body: form, method: 'POST', headers, errorCode: 400 },
          commit: { type: UPLOAD_REPORT_COMMIT, meta: { report: commitPayload } },
          rollback: { type: UPLOAD_REPORT_ROLLBACK, meta: { report: rollbackPayload } }
        }
      }
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
