// @flow
import type { Dispatch, GetState, Action } from 'types/store.types';
import type { RouteState, RouteAction } from 'types/routes.types';

import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

// Actions
const SET_CURRENTLY_TRACKING_LOCATION = 'app/SET_CURRENTLY_TRACKING_LOCATION';

// Reducer
const initialState = {
  currentlyTrackingLocation: undefined,
  previousRoutes: []
};

export default function reducer(state: RouteState = initialState, action: RouteAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { route } = action.payload;
      return { ...state, ...route };
    }
    case SET_CURRENTLY_TRACKING_LOCATION:
      return { ...state, currentlyTrackingLocation: action.payload };
    default:
      return state;
  }
}

export function setCurrentlyTrackingLocation(location: Location): AppAction {
  return {
    type: SET_CURRENTLY_TRACKING_LOCATION,
    payload: location
  };
}
