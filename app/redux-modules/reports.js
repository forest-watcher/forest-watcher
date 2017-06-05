import Config from 'react-native-config';
import tracker from 'helpers/googleAnalytics';
import CONSTANTS from 'config/constants';
import { getLanguage } from 'helpers/language';

// Actions
const GET_REPORT_QUESTIONS_REQUEST = 'report/GET_REPORT_QUESTIONS_REQUEST';
const GET_REPORT_QUESTIONS_COMMIT = 'report/GET_REPORT_QUESTIONS_COMMIT';
const CREATE_REPORT = 'report/CREATE_REPORT';
const UPDATE_REPORT = 'report/UPDATE_REPORT';


// Reducer
const initialNavState = {
  forms: {},
  list: {}
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case GET_REPORT_QUESTIONS_COMMIT: {
      let form = null;
      if (action.payload.data && action.payload.data[0]) {
        form = action.payload.data[0].attributes;
      }
      if (form && form.questions && form.questions.length) {
        form.questions = form.questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
      }
      return Object.assign({}, state, { forms: form });
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
    default: {
      return state;
    }
  }
}

// Action Creators
export function getReportQuestions() {
  const language = getLanguage().toUpperCase();
  let qIdByLanguage = Config[`QUESTIONNARIE_ID_${language}`];
  if (!qIdByLanguage) qIdByLanguage = Config.QUESTIONNARIE_ID_EN; // language fallback
  const url = `${Config.API_URL}/questionnaire/${qIdByLanguage}`;

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

export function createReport(name, position) {
  return {
    type: CREATE_REPORT,
    payload: {
      [name]: {
        index: 0,
        position: position || '0, 0',
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

export function uploadReport(reportName) {
  return (dispatch, state) => {
    const isConnected = state().offline.online;

    if (isConnected) {
      const report = state().form[reportName].values;
      const user = state().user;
      const userName = (user && user.data && user.data.fullName) || 'Guest user';
      const oganization = (user && user.data && user.data.organization) || 'None';
      const reportStatus = state().reports.list[reportName];

      const form = new FormData();
      form.append('name', userName);
      form.append('organization', oganization);
      form.append('date', reportStatus && reportStatus.date);
      form.append('position', reportStatus && reportStatus.position.toString());

      Object.keys(report).forEach((key) => {
        if (report[key].indexOf('jpg') >= 0) { // TODO: improve this
          const image = {
            uri: report[key],
            type: 'image/jpg',
            name: `${reportName}-image-${key}.jpg`
          };
          form.append(key, image);
        } else {
          form.append(key, report[key].toString());
        }
      });

      const language = getLanguage().toUpperCase();
      let qIdByLanguage = Config[`QUESTIONNARIE_ID_${language}`];
      if (!qIdByLanguage) qIdByLanguage = Config.QUESTIONNARIE_ID_EN; // language fallback
      const url = `${Config.API_URL}/questionnaire/${qIdByLanguage}/answer`;

      const fetchConfig = {
        headers: {
          Authorization: `Bearer ${state().user.token}`
        },
        method: 'POST',
        body: form
      };
      fetch(url, fetchConfig)
        .then((response) => {
          if (response.ok) return response.json();
          throw new Error(response.statusText);
        })
        .then(() =>
          dispatch({
            type: UPDATE_REPORT,
            payload: {
              name: reportName,
              data: { status: CONSTANTS.status.uploaded }
            }
          }))
        .catch((err) => console.info('TODO: handle error', err));
    }
  };
}

export function finishReport(reportName) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_REPORT,
      payload: {
        name: reportName,
        data: { status: CONSTANTS.status.complete }
      }
    });
    tracker.trackEvent('Report', 'Complete Report', { label: 'Click Done', value: 0 });
    dispatch(uploadReport(reportName));
  };
}
