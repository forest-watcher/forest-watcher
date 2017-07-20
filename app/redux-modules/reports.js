import Config from 'react-native-config';
import tracker from 'helpers/googleAnalytics';
import CONSTANTS from 'config/constants';
import { LOGOUT_REQUEST } from 'redux-modules/user';


// Actions
const GET_REPORT_QUESTIONS_REQUEST = 'report/GET_REPORT_QUESTIONS_REQUEST';
const GET_REPORT_QUESTIONS_COMMIT = 'report/GET_REPORT_QUESTIONS_COMMIT';
const CREATE_REPORT = 'report/CREATE_REPORT';
const UPDATE_REPORT = 'report/UPDATE_REPORT';
const UPLOAD_REPORT_REQUEST = 'report/UPLOAD_REPORT_REQUEST';
const UPLOAD_REPORT_COMMIT = 'report/UPLOAD_REPORT_COMMIT';
const UPLOAD_REPORT_ROLLBACK = 'report/UPLOAD_REPORT_ROLLBACK';

// Reducer
const initialState = {
  templates: {},
  list: {},
  synced: false,
  syncing: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_REPORT_QUESTIONS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_REPORT_QUESTIONS_COMMIT: {
      const template = action.payload || {};
      if (template.questions && template.questions.length) {
        template.questions = template.questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
      }
      const templates = template.id === Config.REPORT_ID ?
        { ...state.templates, default: template } : { ...state.templates, [template.id]: template };
      return { ...state, templates, synced: true, syncing: false };
    }
    case CREATE_REPORT: {
      const reports = { ...state.list, ...action.payload };
      return Object.assign({}, state, { list: reports });
    }
    case UPDATE_REPORT: {
      const list = Object.assign({}, state.list);
      list[action.payload.name] = Object.assign({}, state.list[action.payload.name], action.payload.data);
      return Object.assign({}, state, { list });
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
      return { ...state, syncing: false };
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
export function getReportQuestions() {
  // TODO: set the template as public in the database and fetch all templates associated to the areas
  const template = Config.REPORT_ID;
  const url = `${Config.API_URL}/reports/${template}`;

  return {
    type: GET_REPORT_QUESTIONS_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: { type: GET_REPORT_QUESTIONS_COMMIT }
      }
    }
  };
}

export function createReport({ name, userPosition, clickedPosition, area }) {
  return {
    type: CREATE_REPORT,
    payload: {
      [name]: {
        area,
        userPosition,
        clickedPosition,
        index: 0,
        status: CONSTANTS.status.draft,
        date: new Date().toISOString()
      }
    }
  };
}

export function saveReport(name, data) {
  return {
    type: UPDATE_REPORT,
    payload: { name, data }
  };
}

export function uploadReport({ reportName, fields }) {
  tracker.trackEvent('Report', 'Complete Report', { label: 'Click Done', value: 0 });
  return (dispatch, state) => {
    const reportValues = state().form[reportName].values;
    const user = state().user;
    const userName = (user && user.data && user.data.fullName) || 'Guest user';
    const organization = (user && user.data && user.data.organization) || 'None';
    const report = state().reports.list[reportName];
    const language = state().app.language;
    const area = report.area;
    const dataset = area.dataset || {};
    const form = new FormData();
    const defaultTemplate = state().reports.templates.default;
    const templateId = report.area.templateId || defaultTemplate.id;

    form.append('report', templateId);
    form.append('areaOfInterest', area.id);
    form.append('startDate', dataset.startDate);
    form.append('endDate', dataset.endDate);
    form.append('layer', dataset.slug);
    form.append('language', language);
    form.append('username', userName);
    form.append('organization', organization);
    form.append('date', report && report.date);
    form.append('clickedPosition', report && report.clickedPosition.toString());
    form.append('userPosition', report && report.userPosition.toString());

    Object.keys(reportValues).forEach((key) => {
      if (fields.includes(key)) {
        if (typeof reportValues[key] === 'string' && reportValues[key].indexOf('jpg') >= 0) { // TODO: improve this
          const image = {
            uri: reportValues[key],
            type: 'image/jpg',
            name: `${reportName}-image-${key}.jpg`
          };
          form.append(key, image);
        } else {
          form.append(key, reportValues[key].toString());
        }
      }
    });

    const requestPayload = {
      name: reportName,
      status: CONSTANTS.status.complete
    };
    const commitPayload = {
      name: reportName,
      status: CONSTANTS.status.uploaded
    };
    const url = `${Config.API_URL}/reports/${Config.REPORT_ID}/answers`;
    const headers = { 'content-type': 'multipart/form-data' };
    dispatch({
      type: UPLOAD_REPORT_REQUEST,
      payload: requestPayload,
      meta: {
        offline: {
          effect: { url, body: form, method: 'POST', headers },
          commit: { type: UPLOAD_REPORT_COMMIT, meta: { report: commitPayload } },
          rollback: { type: UPLOAD_REPORT_ROLLBACK }
        }
      }
    });
  };
}
