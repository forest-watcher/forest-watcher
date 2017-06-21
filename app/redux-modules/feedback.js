import Config from 'react-native-config';
import { destroy } from 'redux-form';
import CONSTANTS from 'config/constants';
import { getLanguage } from 'helpers/language';

import { LOGOUT_REQUEST } from 'redux-modules/user';

// Actions
const GET_FEEDBACK_QUESTIONS_REQUEST = 'feedback/GET_FEEDBACK_QUESTIONS_REQUEST';
const GET_FEEDBACK_QUESTIONS_COMMIT = 'feedback/GET_FEEDBACK_QUESTIONS_COMMIT';
const CREATE_FEEDBACK = 'feedback/CREATE_FEEDBACK';
const UPDATE_FEEDBACK = 'feedback/UPDATE_FEEDBACK';
const UPLOAD_FEEDBACK_REQUEST = 'feedback/UPLOAD_FEEDBACK_REQUEST';
const UPLOAD_FEEDBACK_COMMIT = 'feedback/UPLOAD_FEEDBACK_COMMIT';
const UPLOAD_FEEDBACK_ROLLBACK = 'feedback/UPLOAD_FEEDBACK_ROLLBACK';

// Reducer
const initialState = {
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

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_FEEDBACK_QUESTIONS_REQUEST: {
      const type = action.payload;
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
      const feedback = { ...state.list, ...action.payload };
      return Object.assign({}, state, { list: feedback });
    }
    case UPDATE_FEEDBACK: {
      const list = Object.assign({}, state.list);
      list[action.payload.name] = Object.assign({}, state.list[action.payload.name], action.payload.data);
      return Object.assign({}, state, { list });
    }
    case UPLOAD_FEEDBACK_REQUEST: {
      const { name, status } = action.payload;
      const feedback = state.list[name];
      const list = { ...state.list, [name]: { ...feedback, status } };
      return { ...state, list };
    }
    case UPLOAD_FEEDBACK_COMMIT: {
      const { name, status } = action.meta.feedback;
      const feedback = state.list[name];
      const list = { ...state.list, [name]: { ...feedback, status } };
      return { ...state, list };
    }
    case LOGOUT_REQUEST:
      return initialState;
    default: {
      return state;
    }
  }
}

// Action Creators
export function getFeedbackQuestions(type) {
  const feedbackId = type === 'daily' ? Config.DAILY_FEEDBACK : Config.WEEKLY_FEEDBACK;
  const url = `${Config.API_URL}/reports/${feedbackId}`;
  return {
    type: GET_FEEDBACK_QUESTIONS_REQUEST,
    payload: type,
    meta: {
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
    const report = state().form[type].values;
    const user = state().user;
    const userName = (user && user.data && user.data.attributes && user.data.attributes.fullName) || 'Guest user';
    const organization = (user && user.data && user.data.attributes && user.data.attributes.organization) || 'None';
    const language = getLanguage().toUpperCase();

    const form = new FormData();
    form.append('username', userName);
    form.append('organization', organization);
    form.append('clickedPosition', '0,0');
    form.append('userPosition', '0,0');
    form.append('date', new Date().toISOString());
    form.append('language', language);

    Object.keys(report).forEach((key) => {
      if (typeof report[key] === 'string' && report[key].indexOf('jpg') >= 0) { // TODO: improve this
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

    const feedbackId = type === 'daily' ? Config.DAILY_FEEDBACK : Config.WEEKLY_FEEDBACK;
    const url = `${Config.API_URL}/reports/${feedbackId}/answers`;
    const headers = { 'content-type': 'multipart/form-data' };

    const requestPayload = {
      name: type,
      status: CONSTANTS.status.complete
    };
    const commitPayload = {
      name: type,
      status: CONSTANTS.status.uploaded
    };

    dispatch({
      type: UPLOAD_FEEDBACK_REQUEST,
      payload: requestPayload,
      meta: {
        offline: {
          effect: { url, body: form, method: 'POST', headers },
          commit: { type: UPLOAD_FEEDBACK_COMMIT, meta: { feedback: commitPayload } },
          rollback: { type: UPLOAD_FEEDBACK_ROLLBACK } // TODO: MARK AS UNSYNC TO TRY AGAIN
        }
      }
    });
    dispatch(destroy(type));
  };
}
