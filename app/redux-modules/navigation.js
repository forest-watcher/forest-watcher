import {
  NavigationExperimental
} from 'react-native';

const {
  StateUtils: NavigationStateUtils
} = NavigationExperimental;

// Actions
const NAV_PUSH = 'navigation/NAV_PUSH';
const NAV_POP = 'navigation/NAV_POP';
const NAV_TOGGLE_HEADER = 'navigation/NAV_TOGGLE_HEADER';

// Reducer
const initialNavState = {
  index: 0,
  header: true,
  routes: [
    {
      key: 'dashboard',
      section: 'dashboard'
    }
  ]
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case NAV_PUSH:
      return NavigationStateUtils.push(state, {
        data: action.state.data ? action.state.data : [],
        key: action.state.key,
        section: action.state.section
      });
    case NAV_POP:
      return state.index > 0
        ? NavigationStateUtils.pop(state)
        : state;
    case NAV_TOGGLE_HEADER:
      return Object.assign({}, state, { header: action.header });
    default:
      return state;
  }
}

// Action Creators
export function navigatePush(state) {
  const currentState = typeof state === 'string'
    ? { key: state }
    : state;
  return {
    type: NAV_PUSH,
    state: currentState
  };
}

export function navigatePop() {
  return {
    type: NAV_POP
  };
}

export function toggleHeader(state) {
  return {
    type: NAV_TOGGLE_HEADER,
    ...state
  };
}
