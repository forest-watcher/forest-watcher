// @flow
import type { Dispatch, GetState } from 'types/store.types';
import type { ReportsState, ReportsAction, Report, Answer } from 'types/reports.types';
import type { Area } from 'types/areas.types';

import Config from 'react-native-config';
import merge from 'lodash/merge';
import tracker from 'helpers/googleAnalytics';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';
import CONSTANTS from 'config/constants';
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { getTemplate } from 'helpers/forms';
import { GET_AREAS_COMMIT } from 'redux-modules/areas';

// Actions
const GET_DEFAULT_TEMPLATE_REQUEST = 'report/GET_DEFAULT_TEMPLATE_REQUEST';
const GET_DEFAULT_TEMPLATE_COMMIT = 'report/GET_DEFAULT_TEMPLATE_COMMIT';
const GET_DEFAULT_TEMPLATE_ROLLBACK = 'report/GET_DEFAULT_TEMPLATE_ROLLBACK';
const CREATE_REPORT = 'report/CREATE_REPORT';
const UPDATE_REPORT = 'report/UPDATE_REPORT';
export const UPLOAD_REPORT_REQUEST = 'report/UPLOAD_REPORT_REQUEST';
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
  if (!questions || !questions.length) return [];
  return questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
}

export default function reducer(state: ReportsState = initialState, action: ReportsAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { reports, form } = action.payload;
      if (form) {
        const formatAnswers = values => Object.entries(values)
          .map(([questionName, value]) => ({ questionName, value, child: null }));
        const answers = Object.entries(form)
          .reduce((acc, [reportName, formEntry]) => ({
            ...acc,
            [reportName]: { answers: formatAnswers((formEntry.values || {})) }
          }), {});
        return { ...reports, list: merge(answers, reports.list) };
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
      const templateDefault = state.templates.default || {};
      const templates = action.payload
        .filter(a => a.reportTemplate !== null)
        .reduce((acc, { reportTemplate }) => ({
          ...acc,
          [reportTemplate.id]: {
            ...reportTemplate,
            questions: orderQuestions(reportTemplate.questions)
          }
        }), { default: templateDefault });
      return { ...state, templates };
    }
    case CREATE_REPORT: {
      const list = { ...state.list, ...action.payload };
      return { ...state, list };
    }
    case UPDATE_REPORT: {
      const list = { ...state.list };
      list[action.payload.name] = { ...state.list[action.payload.name], ...action.payload.data };
      return { ...state, list };
    }
    case SET_REPORT_ANSWER: {
      const { reportName, answer, updateOnly } = action.payload;
      const report = state.list[reportName];
      const answeredIndex = report.answers.findIndex(a => (a.questionName === answer.questionName));
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
        commit: { type: GET_DEFAULT_TEMPLATE_COMMIT },
        rollback: { type: GET_DEFAULT_TEMPLATE_ROLLBACK }
      }
    }
  };
}

export function createReport(
  report: { reportName: string, userPosition: [number, number], clickedPosition: [number, number], area: Area }
  ): ReportsAction {
  const { reportName, userPosition, clickedPosition, area } = report;
  return {
    type: CREATE_REPORT,
    payload: {
      [reportName]: {
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

export function saveReport(name: string, data: Report): ReportsAction {
  return {
    type: UPDATE_REPORT,
    payload: { name, data }
  };
}

export function uploadReport(reportName: string) {
  tracker.trackEvent('Report', 'Complete Report', { label: 'Click Done', value: 0 });
  return (dispatch: Dispatch, getState: GetState) => {
    const { user, reports, app } = getState();
    const answers = reports.list[reportName].answers;
    const userName = (user && user.data && user.data.fullName) || 'Guest user';
    const organization = (user && user.data && user.data.organization) || 'None';
    const report = reports.list[reportName];
    const language = app.language || '';
    const area = report.area;
    const dataset = area.dataset || {};
    const template = getTemplate(reports, reportName);

    const form = new FormData();
    form.append('report', template.id);
    form.append('reportName', reportName);
    form.append('areaOfInterest', area.id);
    form.append('startDate', dataset.startDate);
    form.append('endDate', dataset.endDate);
    form.append('layer', dataset.slug);
    form.append('language', language);
    form.append('username', userName);
    form.append('organization', organization);
    form.append('date', report && report.date);
    form.append('clickedPosition', report && report.clickedPosition);
    form.append('userPosition', report && report.userPosition);

    answers.forEach(answer => {
      const appendAnswer = ({ value, questionName }) => {
        // TODO: improve this
        if (typeof value === 'string' && value.indexOf('jpg') >= 0) {
          const image = {
            uri: value,
            type: 'image/jpg',
            name: `${reportName}-image-${questionName}.jpg`
          };
          // $FlowFixMe
          form.append(questionName, image);
        } else {
          form.append(questionName, value.toString());
        }
      };
      appendAnswer(answer);
      if (answer.child) {
        appendAnswer(answer.child);
      }
    });

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
    if (!reports.synced && !reports.syncing) dispatch(getDefaultReport());
  };
}
