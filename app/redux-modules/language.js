import Config from 'react-native-config';
import CONSTANTS from 'config/constants';

// Actions
const SET_LANGUAGE = 'lenguages/SET_LANGUAGE';

// Reducer
const initialState = {
  language: null
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
  }
}
