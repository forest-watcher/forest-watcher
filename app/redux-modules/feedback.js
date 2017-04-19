import Config from 'react-native-config';
import CONSTANTS from 'config/constants';
import { getLanguage } from 'helpers/language';

import { actionTypes } from 'redux-form';

// Actions
const GET_QUESTIONS = 'feedback/GET_QUESTIONS';
const CREATE_FEEDBACK = 'feedback/CREATE_FEEDBACK';
const UPDATE_FEEDBACK = 'feedback/UPDATE_FEEDBACK';


// Reducer
const initialNavState = {
  daily: {},
  weekly: {},
  list: {}
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case GET_QUESTIONS: {
      const feedback = {
        [action.payload.type]: action.payload.data
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
export function getQuestions(type) {
  return (dispatch, state) => {
    const language = getLanguage().toUpperCase();
    let feedbackId = Config[`FEEDBACK_${type.toUpperCase()}_${language}`];
    if (!feedbackId) feedbackId = Config[`FEEDBACK_${type.toUpperCase()}_EN`]; // language fallback
    const url = `${Config.API_URL}/questionnaire/${feedbackId}`;
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
          payload: {
            type,
            data: form
          }
        });
      })
      .catch((err) => {
        // TODO: handle error
        console.warn(err);
      });
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
    // const isConnected = state().app.isConnected;
    const isConnected = true;

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
