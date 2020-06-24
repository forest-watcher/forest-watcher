// @flow
import type { Area } from 'types/areas.types';
import type { Location, RouteState, RouteAction, Route, RouteDeletionCriteria } from 'types/routes.types';
import type { Dispatch, GetState, Thunk } from 'types/store.types';
import { deleteAllLocations } from 'helpers/location';
import generateUniqueID from 'helpers/uniqueId';

import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

// Actions
const DISCARD_ACTIVE_ROUTE = 'routes/DISCARD_ACTIVE_ROUTE';
export const DELETE_ROUTE = 'routes/DELETE_ROUTE';
const FINISH_AND_SAVE_ROUTE = 'routes/FINISH_AND_SAVE_ROUTE';
export const IMPORT_ROUTE = 'routes/IMPORT_ROUTE';
const UPDATE_ACTIVE_ROUTE = 'routes/UPDATE_ACTIVE_ROUTE';
const UPDATE_SAVED_ROUTE = 'routes/UPDATE_SAVED_ROUTE';

// Reducer
const initialState: RouteState = {
  activeRoute: undefined,
  previousRoutes: [],
  routeStructureVersion: 'v2'
};

/**
 * migrateV1RoutesToV2RoutesStructure - given the existing route state & the available areas,
 * attempts to reconcile routes against areas to find the relevant geostoreIds, so the routes
 * are downloadable later on. This will also migrate any of the old route IDs to use a UUID.
 *
 * If the route state doesn't exist / is invalid, the initialState will be returned.
 * If the route state has already been migrated, the existing state will be returned.
 * @param {RouteState} routeState
 * @param {Array<Area>} areas
 * @param {() => string} getUniqueID - unless testing, use the default param provided to get unique uuids
 */
export const migrateV1RoutesToV2RoutesStructure = (
  routeState: ?RouteState,
  areas: ?Array<Area>,
  getUniqueID: () => string = generateUniqueID
): RouteState => {
  if (!routeState || !Array.isArray(routeState.previousRoutes)) {
    return initialState;
  }

  if (routeState.routeStructureVersion === 'v2') {
    // This migration is already complete, so just return the existing state
    return routeState;
  }

  let previousRoutes = [...routeState.previousRoutes];

  const reconcileRouteDetails = route => {
    if (!route || !route.areaId) {
      return route;
    }

    // Attempt to get the geostore ID for the route, using the user's current areas.

    // If the area cannot be found for the given route, we will set the geostoreId to null,
    // but ensure we update the ID to a unique identifier.
    // $FlowFixMe
    const geostoreIdForRoute = areas?.find(area => area.id === route.areaId)?.geostore?.id;

    return {
      ...route,
      id: getUniqueID(),
      geostoreId: geostoreIdForRoute
    };
  };

  previousRoutes = previousRoutes.map(reconcileRouteDetails);

  const activeRoute = reconcileRouteDetails(routeState.activeRoute);

  // Return the new route structure - this has now been migrated!
  return {
    ...routeState,
    activeRoute: activeRoute,
    previousRoutes: previousRoutes,
    routeStructureVersion: 'v2'
  };
};

export default function reducer(state: RouteState = initialState, action: RouteAction): RouteState {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      const { areas, routes } = action.payload;

      const migratedState = migrateV1RoutesToV2RoutesStructure(routes, areas?.data ?? []);

      return {
        ...state,
        ...migratedState
      };
    }
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
        previousRoutes: [...state.previousRoutes, state.activeRoute],
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

export function setRouteDestination(destination: Location, areaId: string): Thunk<RouteAction> {
  return (dispatch: Dispatch, getState: GetState) => {
    deleteAllLocations();

    const geostoreId = getState().areas.data.find(area => area.id === areaId)?.geostore?.id;

    const initialRoute: Route = {
      areaId: areaId,
      destination: destination,
      difficulty: 'easy',
      endDate: null,
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

export function getRoutesById(routeIds: Array<string>): Thunk<Array<Route>> {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    return state.routes.previousRoutes.filter(route => routeIds.includes(route.id));
  };
}

export function getAllRouteIds(): Thunk<Array<string>> {
  return (dispatch: Dispatch, getState: GetState) => {
    const state = getState();
    return state.routes.previousRoutes.map(item => item.id);
  };
}
