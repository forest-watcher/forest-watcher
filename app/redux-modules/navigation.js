import {
  NavigationExperimental
} from 'react-native';

const {
  StateUtils: NavigationStateUtils
} = NavigationExperimental;

// Actions
const NAV_PUSH = 'navigation/NAV_PUSH';
const NAV_POP = 'navigation/NAV_POP';

// Reducer
const initialNavState = {
  index: 0,
  key: 'Home',
  section: '',
  routes: [{ key: 'home', section: 'home' }]
};

export default function reducer(state = initialNavState, action) {
  switch (action.type) {
    case NAV_PUSH:
      return NavigationStateUtils.push(state, {
        key: action.state.key,
        data: action.state.data ? action.state.data : [],
        section: action.state.section
      });
    case NAV_POP:
      return state.index > 0
        ? NavigationStateUtils.pop(state)
        : state;
    default:
      return state;
  }
}

// Action Creators
export function navigatePush(state) {
  const currentState = typeof state === 'string'
    ? { key: state, title: state }
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
