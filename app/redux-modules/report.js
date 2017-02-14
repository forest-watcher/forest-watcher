import Config from 'react-native-config';

// Actions
const GET_QUESTIONS = 'report/GET_QUESTIONS';

// Reducer
const initialNavState = {
  forms: {},
  answers: {}
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case GET_QUESTIONS: {
      return Object.assign({}, state, { forms: action.payload });
    }
    default: {
      return state;
    }
  }
}

// Action Creators
export function getQuestions() {
  return (dispatch, state) => {
    const url = `${Config.API_URL}/questionnaire/${Config.QUESTIONNARIE_ID}`;
    const fetchConfig = {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${state().user.token}`
      }
    };
    fetch(url, fetchConfig)
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response);
      })
      .then((data) => {
        let form = [];
        if (data && data.data && data.data[0]) form = data.data[0].attributes;
        dispatch({
          type: GET_QUESTIONS,
          payload: form
        });
      })
      .catch((err) => {
        // TODO: handle error
        console.warn(err);
      });
  };
}
