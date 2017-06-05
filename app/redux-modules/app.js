// Actions
const SET_LANGUAGE = 'app/SET_LANGUAGE';
export const NET_INFO_CHANGED = 'app/NET_INFO_CHANGED';

// Reducer
const initialState = {
  netInfo: null,
  language: null,
  setupComplete: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
    case NET_INFO_CHANGED:
      return Object.assign({}, state, { netInfo: action.payload });
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
