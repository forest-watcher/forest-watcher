// @flow
import type { RouteState, RouteAction, Route, LocationPoint } from 'types/routes.types';

import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

// Actions
const SET_ROUTE_DESTINATION = 'app/SET_ROUTE_DESTINATION';
const FINISH_AND_SAVE_ROUTE = 'app/FINISH_AND_SAVE_ROUTE';

// Reducer
const initialState: RouteState = {
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
    case FINISH_AND_SAVE_ROUTE:
      return {
        ...state,
        previousRoutes: [...state.previousRoutes, action.payload]
      };
    default:
      return state;
  }
}

export function setRouteDestination(location: Location): RouteAction {
  return {
    type: SET_ROUTE_DESTINATION,
    payload: location
  };
}

/*export function createRouteDummy(): RouteAction {
  return {
    type: CREATE_ROUTE,
    payload: {
      name: 'Test Route 1',
      locations: [],
      date: 123123123,
      difficulty: 'easy',
      language: 'en-GB'
    }
  };
}*/

export function finishAndSaveRoute(route: Route): RouteAction {
  return {
    type: FINISH_AND_SAVE_ROUTE
  };
}
