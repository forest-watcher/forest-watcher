// Actions
const CHANGE_CONNECTION_STATUS = 'app/CHANGE_CONNECTION_STATUS';

// Reducer
const initialState = {
  isConnected: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_CONNECTION_STATUS:
      return Object.assign({}, state, {
        isConnected: action.payload
      });
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
