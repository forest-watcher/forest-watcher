// @flow
import type { Coordinates } from 'types/common.types';
import type { RouteState, RouteAction, Route, RouteDeletionCriteria } from 'types/routes.types';
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import { LOGOUT_REQUEST } from './user';

import { deleteAllLocations } from 'helpers/location';
import generateUniqueID from 'helpers/uniqueId';
import Config from 'react-native-config';

// Actions
const DISCARD_ACTIVE_ROUTE = 'routes/DISCARD_ACTIVE_ROUTE';
export const DELETE_ROUTE = 'routes/DELETE_ROUTE';
const FINISH_AND_SAVE_ROUTE = 'routes/FINISH_AND_SAVE_ROUTE';
export const IMPORT_ROUTE = 'routes/IMPORT_ROUTE';
const UPDATE_ACTIVE_ROUTE = 'routes/UPDATE_ACTIVE_ROUTE';
const UPDATE_SAVED_ROUTE = 'routes/UPDATE_SAVED_ROUTE';
const UPLOAD_ROUTE_REQUEST = 'routes/UPLOAD_ROUTE_REQUEST';
export const UPLOAD_ROUTE_COMMIT = 'routes/UPLOAD_ROUTE_COMMIT';
export const UPLOAD_ROUTE_ROLLBACK = 'routes/UPLOAD_ROUTE_ROLLBACK';
const FETCH_ROUTES_REQUEST = 'routes/FETCH_ROUTES_REQUEST';
const FETCH_ROUTES_COMMIT = 'routes/FETCH_ROUTES_COMMIT';
const FETCH_ROUTES_ROLLBACK = 'routes/FETCH_ROUTES_ROLLBACK';
const DELETE_ROUTE_REQUEST = 'routes/DELETE_ROUTE_REQUEST';
const DELETE_ROUTE_COMMIT = 'routes/DELETE_ROUTE_COMMIT';
const DELETE_ROUTE_ROLLBACK = 'routes/DELETE_ROUTE_ROLLBACK';

// Reducer
const initialState: RouteState = {
  activeRoute: undefined,
  previousRoutes: [],
  synced: false,
  syncing: false
};

export default function reducer(state: RouteState = initialState, action: RouteAction): RouteState {
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
          ...(state.activeRoute ?? {}),
          ...action.payload
        }
      };
    case UPDATE_SAVED_ROUTE:
      return {
        ...state,
        previousRoutes: state.previousRoutes.map((route: Route) =>
          route.id === action.payload.id
            ? {
                ...route,
                ...action.payload
              }
            : route
        )
      };
    case IMPORT_ROUTE: {
      const routeToImport = action.payload;
      if (routeToImport) {
        // Ignore the saved route if it already exists - this could happen when importing an area for example
        const possiblyPreexistingRoute = state.previousRoutes.find(route => route.id === routeToImport.id);
        if (!possiblyPreexistingRoute) {
          return {
            ...state,
            previousRoutes: [...state.previousRoutes, routeToImport]
          };
        } else {
          console.warn('3SC', `Ignore already existing route with ID ${routeToImport.id}`);
        }
      }
      return state;
    }
    case FINISH_AND_SAVE_ROUTE:
      return {
        ...state,
        previousRoutes: [
          ...state.previousRoutes,
          {
            ...state.activeRoute,
            status: 'completed'
          }
        ],
        activeRoute: undefined
      };
    case DELETE_ROUTE:
      if (action.payload.id) {
        return {
          ...state,
          previousRoutes: state.previousRoutes.filter((route: Route) => route.id !== action.payload.id)
        };
      } else if (action.payload.areaId) {
        return {
          ...state,
          previousRoutes: state.previousRoutes.filter((route: Route) => route.areaId !== action.payload.areaId)
        };
      } else {
        return state;
      }
    case UPLOAD_ROUTE_REQUEST:
      return { ...state, syncing: true, synced: false };
    case UPLOAD_ROUTE_COMMIT: {
      return { ...state, syncing: false, synced: true };
    }
    case UPLOAD_ROUTE_ROLLBACK:
      return { ...state, syncing: false, synced: true };
    case FETCH_ROUTES_REQUEST:
      return { ...state, syncing: false, synced: true };
    case FETCH_ROUTES_COMMIT: {
      const previousRoutes = state.previousRoutes;
      const routes = action.payload;
      routes.forEach(route => {
        const index = previousRoutes.findIndex(
          x => x.id === route.routeId || x.routeId === route.routeId || x.id === route.id
        );
        if (index !== -1) {
          previousRoutes[index] = route;
          previousRoutes[index].status = 'uploaded';
        } else {
          previousRoutes.push({ ...route, status: 'uploaded' });
        }
      });
      // un-upload routes that were deleted by managers
      for (let i = 0; i < previousRoutes.length; i++) {
        const index = routes.findIndex(x => x.id === previousRoutes[i].id);
        if (index === -1) {
          previousRoutes[i] = {
            ...previousRoutes[i],
            id: previousRoutes[i].routeId || previousRoutes[i].id,
            status: 'completed'
          };
        }
      }
      return { ...state, previousRoutes: [...previousRoutes], synced: true, syncing: false };
    }
    case FETCH_ROUTES_ROLLBACK:
      return { ...state, synced: true, syncing: false };
    case DELETE_ROUTE_REQUEST:
      return { ...state, synced: false, syncing: true };
    case DELETE_ROUTE_COMMIT:
      return { ...state, synced: true, syncing: false };
    case DELETE_ROUTE_ROLLBACK:
      return { ...state, synced: true, syncing: false };
    case LOGOUT_REQUEST: {
      return initialState;
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

export function setRouteDestination(destination: Coordinates, areaId: string, teamId?: ?string): Thunk<RouteAction> {
  return (dispatch: Dispatch, getState: GetState) => {
    deleteAllLocations();

    const geostoreId = getState().areas.data.find(area => area.id === areaId)?.geostore?.id;

    const initialRoute: Route = {
      areaId: areaId,
      destination: destination,
      difficulty: 'easy',
      status: 'draft',
      endDate: null,
      teamId,
      geostoreId: geostoreId,
      id: generateUniqueID(),
      locations: [],
      name: '', // will be named on saving
      startDate: Date.now()
    };
    dispatch({
      type: UPDATE_ACTIVE_ROUTE,
      payload: initialRoute
    });
  };
}

export function updateActiveRoute(route: $Shape<Route>): RouteAction {
  return {
    type: UPDATE_ACTIVE_ROUTE,
    payload: {
      ...route
    }
  };
}

export function updateSavedRoute(route: $Shape<Route>): RouteAction {
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

export function finishAndSaveRoute(): Thunk<RouteAction> {
  return {
    type: FINISH_AND_SAVE_ROUTE
  };
}

export function uploadRoutes(routes: Array<Route>): RouteAction {
  const url = `${Config.API_V3_URL}/routes/sync`;
  const headers = { 'Content-Type': 'application/json' };

  return {
    type: UPLOAD_ROUTE_REQUEST,
    meta: {
      offline: {
        effect: { url, method: 'POST', headers, body: JSON.stringify(routes) },
        commit: {
          type: UPLOAD_ROUTE_COMMIT,
          meta: {
            routes,
            then: payload => (dispatch, state) => {
              dispatch(getRoutes());
            }
          }
        },
        rollback: { type: UPLOAD_ROUTE_ROLLBACK }
      }
    }
  };
}

export function deleteRoute(route: Route): RouteAction {
  const url = `${Config.API_V3_URL}/routes/${route.id}`;

  return {
    type: DELETE_ROUTE_REQUEST,
    meta: {
      offline: {
        effect: { url, method: 'DELETE' },
        commit: { type: DELETE_ROUTE_COMMIT },
        rollback: { type: DELETE_ROUTE_ROLLBACK }
      }
    }
  };
}

export function getRoutes(): RouteAction {
  const url = `${Config.API_V3_URL}/routes/user`;
  return {
    type: FETCH_ROUTES_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: { type: FETCH_ROUTES_COMMIT },
        rollback: { type: FETCH_ROUTES_ROLLBACK }
      }
    }
  };
}

export function getAllRouteIds(): Thunk<Array<string>> {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    return state.routes.previousRoutes.map(item => item.id);
  };
}

export function syncRoutes(): (dispatch: Dispatch, state: GetState) => void {
  return (dispatch: Dispatch, state: GetState) => {
    const { syncing, synced } = state().routes;
    const { loggedIn } = state().user;
    if (!syncing && !synced && loggedIn) {
      dispatch(getRoutes());
    }
  };
}
