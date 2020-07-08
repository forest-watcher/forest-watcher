// @flow
import type { Area } from 'types/areas.types';
import type { Route, RouteState } from 'types/routes.types';
import type { State } from 'types/store.types';

import createMigration from 'redux-persist-migrate';
import generateUniqueID from 'helpers/uniqueId';

export const CURRENT_REDUX_STATE_VERSION = 2;

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
// eslint-disable-next-line import/no-unused-modules
export const migrateV1RoutesToV2RoutesStructure = (
  routeState: ?RouteState,
  areas: ?Array<Area>,
  getUniqueID: () => string = generateUniqueID
): ?RouteState => {
  if (!routeState || !Array.isArray(routeState.previousRoutes)) {
    return undefined;
  }

  const reconcileRouteDetails = (route: Route) => {
    if (!route.areaId) {
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

  const activeRoute = routeState.activeRoute ? reconcileRouteDetails(routeState.activeRoute) : undefined;

  // Return the new route structure - this has now been migrated!
  return {
    ...routeState,
    activeRoute: activeRoute,
    previousRoutes: routeState.previousRoutes.map(reconcileRouteDetails)
  };
};

const manifest = {
  // $FlowFixMe
  2: (state: State): State => {
    console.warn('3SC', 'Migrate Redux state to v2');
    return {
      ...state,
      alerts: {
        ...state.alerts,
        canDisplayAlerts: undefined,
        reported: undefined
      },
      app: {
        ...state.app,
        actions: undefined, // Removed key
        // Set the isUpdate flag so we can show different onboarding to returning vs new users
        isUpdate: true
      },
      areas: {
        ...state.areas,
        selectedAreaId: undefined // Removed key
      },
      layers: {
        ...state.layers,
        activeLayer: undefined, // Removed key
        // Different types of layers can now be held in state.layers.data, but everything migrated from v1 will be contextual layer
        data: state.layers.data.map(layer => ({
          ...layer,
          type: 'contextual_layer'
        }))
      },
      routes: migrateV1RoutesToV2RoutesStructure(state.routes, state.areas.data)
    };
  }
};

const migrationEnhancer = createMigration(
  manifest,
  (state: State): number => {
    // Check if we're a completely fresh install
    if (!state.app) {
      return CURRENT_REDUX_STATE_VERSION;
    }
    // Check if we're migrating from an existing install before we added reduxVersion to state
    if (!state.app.reduxVersion) {
      return 1; // default to 1 if not defined, and migrate
    }

    return state.app.reduxVersion;
  },
  (state: State, version: number): State => {
    console.warn('3SC', `Migrated Redux state to v${version}`);
    return { ...state, app: { ...state.app, reduxVersion: version } };
  }
);

export default migrationEnhancer;
