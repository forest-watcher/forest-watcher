// @flow
import type { RouteState, RouteAction, Route } from 'types/routes.types';
import { deleteAllLocations } from '../helpers/location';

// Actions
const DISCARD_ACTIVE_ROUTE = 'routes/DISCARD_ACTIVE_ROUTE';
const DELETE_ROUTE = 'routes/DELETE_ROUTE';
const FINISH_AND_SAVE_ROUTE = 'routes/FINISH_AND_SAVE_ROUTE';
const UPDATE_ACTIVE_ROUTE = 'routes/UPDATE_ACTIVE_ROUTE';
const UPDATE_SAVED_ROUTE = 'routes/UPDATE_SAVED_ROUTE';

// Reducer
const initialState: RouteState = {
  activeRoute: undefined,
  previousRoutes: []
};

export default function reducer(state: RouteState = initialState, action: RouteAction) {
  switch (action.type) {
    case DISCARD_ACTIVE_ROUTE:
      return {
        ...state,
        activeRoute: null
      };
    case UPDATE_ACTIVE_ROUTE:
      return {
        ...state,
        activeRoute: {
          ...state.activeRoute,
          ...action.payload
        }
      };
    case UPDATE_SAVED_ROUTE:
      return {
        ...state,
        previousRoutes: state.previousRoutes.map(route =>
          route.id === action.payload.id
            ? {
                ...route,
                ...action.payload
              }
            : route
        )
      };
    case FINISH_AND_SAVE_ROUTE:
      return {
        ...state,
        previousRoutes: [...state.previousRoutes, state.activeRoute],
        activeRoute: undefined
      };
    case DELETE_ROUTE:
      if (action.payload.id) {
        return {
          ...state,
          previousRoutes: state.previousRoutes.filter(route => route.id !== action.payload.id)
        };
      } else if (action.payload.areaId) {
        return {
          ...state,
          previousRoutes: state.previousRoutes.filter(route => route.areaId != action.payload.areaId)
        };
      } else {
        return state;
      }
    default:
      return state;
  }
}

export function deleteRoutes(criteria: RouteDeletionCriteria): RouteAction {
  return {
    type: DELETE_ROUTE,
    payload: criteria
  };
}

export function setRouteDestination(destination: Location, areaId: string): RouteAction {
  deleteAllLocations();
  return {
    type: UPDATE_ACTIVE_ROUTE,
    payload: {
      areaId: areaId,
      destination: destination,
      startDate: Date.now()
    }
  };
}

export function updateActiveRoute(route: Route): RouteAction {
  return {
    type: UPDATE_ACTIVE_ROUTE,
    payload: {
      ...route
    }
  };
}

export function updateSavedRoute(route: Route): RouteAction {
  return {
    type: UPDATE_SAVED_ROUTE,
    payload: {
      ...route
    }
  };
}
export function discardActiveRoute(): RouteAction {
  return {
    type: DISCARD_ACTIVE_ROUTE
  };
}

export function finishAndSaveRoute(): RouteAction {
  return {
    type: FINISH_AND_SAVE_ROUTE
  };
}
