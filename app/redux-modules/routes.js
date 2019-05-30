// @flow
import type { RouteState, RouteAction, Route, LocationPoint } from 'types/routes.types';

import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

// Actions
const SET_ROUTE_DESTINATION = 'app/SET_ROUTE_DESTINATION';
const CREATE_ROUTE = 'app/CREATE_ROUTE';
const FINISH_AND_SAVE_ROUTE = 'app/FINISH_AND_SAVE_ROUTE';
const ADD_LOCATION_TO_ROUTE = 'app/ADD_LOCATION_TO_ROUTE';

// Reducer
const initialState: RouteState = {
  routeDestination: undefined,
  previousRoutes: [],
  currentRoute: undefined
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
    case CREATE_ROUTE:
      return {
        ...state,
        currentRoute: action.payload
      };
    case FINISH_AND_SAVE_ROUTE:
      return {
        ...state,
        previousRoutes: [...state.previousRoutes, state.currentRoute],
        currentRoute: undefined
      };
    case ADD_LOCATION_TO_ROUTE:
      return {
        ...state,
        currentRoute: { ...state.currentRoute, locations: [...state.currentRoute.locations, action.payload] }
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

export function createRoute(route: Route): RouteAction {
  return {
    type: CREATE_ROUTE,
    payload: route
  };
}

export function createRouteDummy(): RouteAction {
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
}

export function finishAndSaveRoute(): RouteAction {
  return {
    type: FINISH_AND_SAVE_ROUTE
  };
}

export function addLocationToRoute(locationPoint: LocationPoint): RouteAction {
  return {
    type: ADD_LOCATION_TO_ROUTE,
    payload: locationPoint
  };
}
