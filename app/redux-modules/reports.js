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
  forms: {},
  list: {},
  synced: false,
  syncing: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_REPORT_QUESTIONS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_REPORT_QUESTIONS_COMMIT: {
      const form = action.payload || {};
      if (form.questions && form.questions.length) {
        form.questions = form.questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
      }
      return Object.assign({}, state, { forms: form, synced: true, syncing: false });
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
  const report = Config.REPORT_ID;
  const url = `${Config.API_URL}/reports/${report}`;

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

export function uploadReport(reportName, fields) {
  tracker.trackEvent('Report', 'Complete Report', { label: 'Click Done', value: 0 });
  return (dispatch, state) => {
    const report = state().form[reportName].values;
    const user = state().user;
    const userName = (user && user.data && user.data.fullName) || 'Guest user';
    const organization = (user && user.data && user.data.organization) || 'None';
    const reportStatus = state().reports.list[reportName];
    const language = state().app.language;
    const area = reportStatus.area;
    const dataset = area.dataset || {};
    const form = new FormData();

    form.append('areaOfInterest', area.id);
    form.append('startDate', dataset.startDate);
    form.append('endDate', dataset.endDate);
    form.append('layer', dataset.slug);
    form.append('language', language);
    form.append('username', userName);
    form.append('organization', organization);
    form.append('date', reportStatus && reportStatus.date);
    form.append('clickedPosition', reportStatus && reportStatus.clickedPosition.toString());
    form.append('userPosition', reportStatus && reportStatus.userPosition.toString());

    Object.keys(report).forEach((key) => {
      if (fields.includes(key)) {
        if (typeof report[key] === 'string' && report[key].indexOf('jpg') >= 0) { // TODO: improve this
          const image = {
            uri: report[key],
            type: 'image/jpg',
            name: `${reportName}-image-${key}.jpg`
          };
          form.append(key, image);
        } else {
          form.append(key, report[key].toString());
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
