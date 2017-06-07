import Config from 'react-native-config';
import CONSTANTS from 'config/constants';
import { getLanguage } from 'helpers/language';

import { actionTypes } from 'redux-form';

// Actions
const GET_FEEDBACK_QUESTIONS_REQUEST = 'feedback/GET_FEEDBACK_QUESTIONS_REQUEST';
const GET_FEEDBACK_QUESTIONS_COMMIT = 'feedback/GET_FEEDBACK_QUESTIONS_COMMIT';
const CREATE_FEEDBACK = 'feedback/CREATE_FEEDBACK';
const UPDATE_FEEDBACK = 'feedback/UPDATE_FEEDBACK';


// Reducer
const initialNavState = {
  daily: {},
  weekly: {},
  list: {},
  synced: {
    daily: false,
    weekly: false
  },
  syncing: {
    daily: false,
    weekly: false
  }
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case GET_FEEDBACK_QUESTIONS_REQUEST: {
      const { type } = action.meta;
      const synced = { ...state.synced, [type]: false };
      const syncing = { ...state.syncing, [type]: true };
      return { ...state, synced, syncing };
    }
    case GET_FEEDBACK_QUESTIONS_COMMIT: {
      let form = null;
      if (action.payload && action.payload[0]) {
        form = action.payload[0];
      }
      if (form && form.questions && form.questions.length) {
        form.questions = form.questions.sort((a, b) => parseInt(a.order, 10) - parseInt(b.order, 10));
      }
      const { type } = action.meta;
      const feedback = {
        [type]: form,
        synced: { ...state.synced, [type]: true },
        syncing: { ...state.syncing, [type]: false }
      };
      return Object.assign({}, state, feedback);
    }
    case CREATE_FEEDBACK: {
      const reports = { ...state.list, ...action.payload };
      return Object.assign({}, state, { list: reports });
    }
    case UPDATE_FEEDBACK: {
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
export function getFeedbackQuestions(type) {
  const language = getLanguage().toUpperCase();
  let feedbackId = Config[`FEEDBACK_${type.toUpperCase()}_${language}`];
  if (!feedbackId) feedbackId = Config[`FEEDBACK_${type.toUpperCase()}_EN`]; // language fallback
  const url = `${Config.API_URL}/questionnaire/${feedbackId}`;
  return {
    type: GET_FEEDBACK_QUESTIONS_REQUEST,
    meta: {
      type,
      offline: {
        effect: { url },
        commit: { type: GET_FEEDBACK_QUESTIONS_COMMIT, meta: { type } }
      }
    }
  };
}

export function createFeedback(name, position) {
  return {
    type: CREATE_FEEDBACK,
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

export function saveFeedback(name, data) {
  return {
    type: UPDATE_FEEDBACK,
    payload: { name, data }
  };
}

export function uploadFeedback(type) {
  return (dispatch, state) => {
    const isConnected = state().offline.online;
    if (isConnected) {
      const report = state().form[type].values;
      const user = state().user;
      const userName = (user && user.data && user.data.attributes && user.data.attributes.fullName) || 'Guest user';
      const oganization = (user && user.data && user.data.attributes && user.data.attributes.organization) || 'Vizzuality';
      const reportStatus = state().reports.list[type];

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
            name: `${type}-image-${key}.jpg`
          };
          form.append(key, image);
        } else {
          form.append(key, report[key].toString());
        }
      });

      const language = getLanguage().toUpperCase();
      let feedbackId = Config[`FEEDBACK_${type.toUpperCase()}_${language}`];
      if (!feedbackId) feedbackId = Config[`FEEDBACK_${type.toUpperCase()}_EN`]; // language fallback
      const url = `${Config.API_URL}/questionnaire/${feedbackId}/answer`;

      // const xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;
      // xhr.open('POST', url);
      // xhr.setRequestHeader('authorization', `Bearer ${state().user.token}`);
      // xhr.addEventListener('readystatechange', () => {
      //   if (xhr.readyState === 4) {
      //     if (xhr.status === 200) {
      //       console.log('iuhuuuu', xhr.responseText);
      //       dispatch({
      //         type: UPDATE_FEEDBACK,
      //         payload: {
      //           name: type,
      //           data: { status: CONSTANTS.status.uploaded }
      //         }
      //       });
      //     } else {
      //       console.log('TODO: handle error', xhr.responseText);
      //     }
      //   }
      // });

      // xhr.send(form);

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
        .then((response) => {
          console.info('TODO: save response', response);
          dispatch({
            type: UPDATE_FEEDBACK,
            payload: {
              name: type,
              data: { status: CONSTANTS.status.uploaded }
            }
          });
          dispatch({
            type: actionTypes.DESTROY,
            meta: {
              form: [type]
            }
          });
        })
        .catch((err) => {
          console.info('TODO: handle error', err);
        });
    } else {
      console.info('TODO: handle submit form on no connection');
    }
  };
}

export function finishFeedback(type) {
  return (dispatch) => {
    dispatch({
      type: UPDATE_FEEDBACK,
      payload: {
        name: type,
        data: { status: CONSTANTS.status.complete }
      }
    });
    dispatch(uploadFeedback(type));
  };
}
