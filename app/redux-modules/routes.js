// @flow
import type { Dispatch, GetState, Action } from 'types/store.types';
import type { RouteState, RouteAction } from 'types/routes.types';

import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

// Actions
const SET_ROUTE_DESTINATION = 'app/SET_ROUTE_DESTINATION';

// Reducer
const initialState = {
  routeDestination: undefined,
  previousRoutes: []
};

export default function reducer(state: RouteState = initialState, action: RouteAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { route } = action.payload;
      return { ...state, ...route };
    }
    case SET_ROUTE_DESTINATION:
      return { ...state, routeDestination: action.payload };
    default:
      return state;
  }
}

export function setRouteDestination(location: Location): AppAction {
  return {
    type: SET_ROUTE_DESTINATION,
    payload: location
  };
}
