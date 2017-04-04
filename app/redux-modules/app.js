// Actions
const CHANGE_CONNECTION_STATUS = 'app/CHANGE_CONNECTION_STATUS';
const SET_LANGUAGE = 'app/SET_LANGUAGE';

// Reducer
const initialState = {
  isConnected: false,
  language: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_CONNECTION_STATUS:
      return Object.assign({}, state, {
        isConnected: action.payload,
      });
    case SET_LANGUAGE:
      return Object.assign({}, state, { language: action.payload });
    default:
      return state;
  }
}

// Action Creators
export function setIsConnected(isConnected) {
  return {
    type: CHANGE_CONNECTION_STATUS,
    payload: isConnected
  };
}

export function setLanguage(language) {
  return (dispatch) => {
    dispatch({
      type: SET_LANGUAGE,
      payload: language
    });
  }
}
