import Config from 'react-native-config';
import tracker from 'helpers/googleAnalytics';
import CONSTANTS from 'config/constants';
import { getLanguage } from 'helpers/language';

// Actions
const GET_QUESTIONS = 'report/GET_QUESTIONS';
const CREATE_REPORT = 'report/CREATE_REPORT';
const UPDATE_REPORT = 'report/UPDATE_REPORT';


// Reducer
const initialNavState = {
  forms: {},
  list: {}
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case GET_QUESTIONS: {
      return Object.assign({}, state, { forms: action.payload });
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
export function getQuestions() {
  return (dispatch, state) => {
    if (state().offline.online) {
      const language = getLanguage().toUpperCase();
      let qIdByLanguage = Config[`QUESTIONNARIE_ID_${language}`];
      if (!qIdByLanguage) qIdByLanguage = Config.QUESTIONNARIE_ID_EN; // language fallback
      const url = `${Config.API_URL}/questionnaire/${qIdByLanguage}`;
      const fetchConfig = {
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${state().user.token}`
        }
      };
      fetch(url, fetchConfig)
        .then(response => {
          if (response.ok) return response.json();
          throw new Error(response.statusText);
        })
        .then((data) => {
          let form = null;
          if (data && data.data && data.data[0]) {
            form = data.data[0].attributes;
          }
          if (form && form.questions && form.questions.length) {
            form.questions = form.questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
          }
          dispatch({
            type: GET_QUESTIONS,
            payload: form
          });
        })
        .catch((err) => {
          // TODO: handle error
          console.warn(err);
        });
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
