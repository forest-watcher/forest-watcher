import Config from 'react-native-config';
import tracker from 'helpers/googleAnalytics';
import CONSTANTS from 'config/constants';
import { getLanguage } from 'helpers/language';

// Actions
const GET_REPORT_QUESTIONS_REQUEST = 'report/GET_REPORT_QUESTIONS_REQUEST';
const GET_REPORT_QUESTIONS_COMMIT = 'report/GET_REPORT_QUESTIONS_COMMIT';
const CREATE_REPORT = 'report/CREATE_REPORT';
const UPDATE_REPORT = 'report/UPDATE_REPORT';
const UPLOAD_REPORT_REQUEST = 'report/UPLOAD_REPORT_REQUEST';
const UPLOAD_REPORT_COMMIT = 'report/UPLOAD_REPORT_COMMIT';
const UPLOAD_REPORT_ROLLBACK = 'report/UPLOAD_REPORT_ROLLBACK';

const reportExample = {
  "data": [
    {
      "type": "reports",
      "id": "591f2513d3a6c4003f4960b4",
      "attributes": {
        "name": {
          "en": "My first report",
          "es": "Mi primer informe"
        },
        "languages": [
          "en",
          "es"
        ],
        "defaultLanguage": "en",
        "user": "1a10d7c6e0a37126611fd7a7",
        "questions": [
          {
            "type": "text",
            "name": "name",
            "defaultValue": {
              "en": "Insert your name",
              "es": "Inserta tu nombre"
            },
            "_id": "591f2513d3a6c4003f4960b7",
            "conditions": [],
            "childQuestions": [],
            "order": 1,
            "required": false,
            "label": {
              "en": "Name",
              "es": "Nombre"
            }
          },
          {
            "type": "checkbox",
            "name": "age",
            "defaultValue": 0,
            "_id": "591f2513d3a6c4003f4960b5",
            "conditions": [],
            "childQuestions": [
              {
                "type": "text",
                "name": "specific-age",
                "defaultValue": {
                  "en": "Specific age",
                  "es": "Specifica tu edad"
                },
                "conditionalValue": 0,
                "_id": "591f2513d3a6c4003f4960b6",
                "order": 0,
                "required": false
              }
            ],
            "order": 2,
            "required": false,
            "values": {
              "en": [
                {
                  "value": 0,
                  "label": "18-30"
                },
                {
                  "value": 1,
                  "label": "31-65"
                }
              ],
              "es": [
                {
                  "value": 0,
                  "label": "18-30"
                },
                {
                  "value": 1,
                  "label": "31-65"
                }
              ]
            },
            "label": {
              "en": "Range age",
              "es": "Rango de edad"
            }
          }
        ],
        "createdAt": "2017-05-19T17:02:11.415Z"
      }
    }
  ]
};

// Reducer
const initialNavState = {
  forms: {},
  list: {},
  synced: false,
  syncing: false
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case GET_REPORT_QUESTIONS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_REPORT_QUESTIONS_COMMIT: {
      let form = null;
      if (action.payload && action.payload[0]) {
        form = reportExample;
      }
      if (form && form.questions && form.questions.length) {
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
  tracker.trackEvent('Report', 'Complete Report', { label: 'Click Done', value: 0 });
  return (dispatch, state) => {
    const report = state().form[reportName].values;
    const user = state().user;
    const userName = (user && user.data && user.data.fullName) || 'Guest user';
    const oganization = (user && user.data && user.data.organization) || 'None';
    const reportStatus = state().reports.list[reportName];

    // TODO: save type, lat and long position of the alert in the report
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
    const requestPayload = {
      name: reportName,
      status: CONSTANTS.status.complete
    };
    const commitPayload = {
      name: reportName,
      status: CONSTANTS.status.uploaded
    };
    const url = `${Config.API_URL}/reports/${report.id}/answers`;
    dispatch({
      type: UPLOAD_REPORT_REQUEST,
      payload: requestPayload,
      meta: {
        offline: {
          effect: { url, body: form, method: 'POST' },
          commit: { type: UPLOAD_REPORT_COMMIT, meta: commitPayload },
          rollback: { type: UPLOAD_REPORT_ROLLBACK } // TODO: MARK AS UNSYNC TO TRY AGAIN
        }
      }
    });

    // const language = getLanguage().toUpperCase();
    // let qIdByLanguage = Config[`QUESTIONNARIE_ID_${language}`];
    // if (!qIdByLanguage) qIdByLanguage = Config.QUESTIONNARIE_ID_EN; // language fallback
    // const url = `${Config.API_URL}/questionnaire/${qIdByLanguage}/answer`;

    // const fetchConfig = {
    //   headers: {
    //     Authorization: `Bearer ${state().user.token}`
    //   },
    //   method: 'POST',
    //   body: form
    // };
    // fetch(url, fetchConfig)
    //   .then((response) => {
    //     if (response.ok) return response.json();
    //     throw new Error(response.statusText);
    //   })
    //   .then(() =>
    //     dispatch({
    //       type: UPDATE_REPORT,
    //       payload: {
    //         name: reportName,
    //         data: { status: CONSTANTS.status.uploaded }
    //       }
    //     }))
    //   .catch((err) => console.info('TODO: handle error', err));
  };
}
