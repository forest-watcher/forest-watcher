import { AppNavigator } from 'app/main.js';

// Actions
const NAV_PUSH = 'navigation/NAV_PUSH';
const NAV_POP = 'navigation/NAV_POP';
const NAV_SHOW_HEADER = 'navigation/NAV_SHOW_HEADER';

// Reducer
const initialNavState = {
  index: 0,
  routes: [
    { key: 'InitA', routeName: 'Dashboard' }
  ]
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case NAV_PUSH: {
      return AppNavigator.router.getStateForAction({ type: 'Navigate', routeName: action.routeName }, state);
    }
    case NAV_POP: {
      return AppNavigator.router.getStateForAction({ type: 'Back' }, state);
    }
    default: {
      return AppNavigator.router.getStateForAction(action, state);
    }
  }
}

// Action Creators
export function navigatePush(routeName) {
  return {
    type: NAV_PUSH,
    routeName
  };
}

export function navigatePop() {
  return {
    type: NAV_POP
  };
}

export function showNavHeader(newState) {
  return {
    type: NAV_SHOW_HEADER,
    state: newState
  };
}
