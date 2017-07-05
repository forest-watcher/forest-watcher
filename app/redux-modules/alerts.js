// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';

const SET_CAN_DISPLAY_ALERTS = 'alerts/SET_CAN_DISPLAY_ALERTS';

// Reducer
const initialState = {
  data: {},
  canDisplayAlerts: true
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_CAN_DISPLAY_ALERTS:
      return { ...state, canDisplayAlerts: action.payload };
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      return state;
  }
}

// Action Creators
export function setCanDisplayAlerts(canDisplay) {
  return {
    type: SET_CAN_DISPLAY_ALERTS,
    payload: canDisplay
  };
}
