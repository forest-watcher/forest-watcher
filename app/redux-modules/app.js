// Actions
const SET_LANGUAGE = 'app/SET_LANGUAGE';

// Reducer
const initialState = {
  isConnected: true,
  language: null,
  setupComplete: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
    default:
      return state;
  }
}

// Action Creators
export function setLanguage(language) {
  return (dispatch) => {
    dispatch({
      type: SET_LANGUAGE,
      payload: language
    });
  };
}
