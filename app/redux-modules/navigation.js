import { AppNavigator } from 'app/main';

// Actions
const NAV_PUSH = 'navigation/NAV_PUSH';
const NAV_POP = 'navigation/NAV_POP';
const NAV_RESET = 'navigation/NAV_RESET';
const NAV_SHOW_HEADER = 'navigation/NAV_SHOW_HEADER';

// Reducer
const initialNavState = {
  index: 0,
  routes: [
    { routeName: 'Setup', key: 'setup' }
  ]
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case NAV_PUSH: {
      return AppNavigator.router.getStateForAction({ type: 'NAVIGATE', routeName: action.routeName }, state);
    }
    case NAV_RESET: {
      console.log(action.routeName, 'reset');
      return AppNavigator.router.getStateForAction({
        type: 'RESET',
        index: 0,
        actions: [{ type: 'Navigate', routeName: 'Dashboard' }]
      }, state);
    }
    case NAV_POP: {
      return AppNavigator.router.getStateForAction({ type: 'BACK' }, state);
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

export function navigateReset(routeName) {
  return {
    type: NAV_RESET,
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
