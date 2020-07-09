// @flow
import type { Area } from 'types/areas.types';
import type { LayerDownloadProgress } from 'types/layers.types';
import type { Route, RouteState } from 'types/routes.types';
import type { Dispatch, State } from 'types/store.types';

import createMigration from 'redux-persist-migrate';
import generateUniqueID from 'helpers/uniqueId';
import { migrateReportAttachmentsFromV1ToV2 } from 'redux-modules/reports';
import migrateLayerFilesFromV1ToV2 from 'helpers/layer-store/migrateLayerFilesFromV1ToV2';

export const CURRENT_REDUX_STATE_VERSION = 2;

/**
 * Migrate files from their locations in v1 to their new locations in v2
 */
export async function migrateFilesFromV1ToV2(dispatch: Dispatch) {
  // Even if one migration fails, we will attempt the other, so keep track of any errors
  let error = null;

  console.warn('3SC', 'Migrate files to v2');
  try {
    await dispatch(migrateReportAttachmentsFromV1ToV2());
  } catch (err) {
    console.warn('3SC', 'Could not migrate report attachments', err);
    error = err;
  }

  try {
    await migrateLayerFilesFromV1ToV2();
  } catch (err) {
    console.warn('3SC', 'Could not migrate layer files', err);
    error = err;
  }

  if (error) {
    throw error;
  }
  console.warn('3SC', 'Migrated files to v2');
}

/**
 * v2 layer progress state is simplified and uses a different hierarchy, so port across the relevant parts from v1
 */
const migrateLayerCacheStateFromV1ToV2 = (v1Cache: { [string]: { [string]: string } }): LayerDownloadProgress => {
  const v2Cache: LayerDownloadProgress = {};

  if (!v1Cache) {
    return v2Cache;
  }

  Object.entries(v1Cache)
    .filter(item => item[0] !== 'basemap')
    .forEach(([layerId, v1LayerCache]) => {
      Object.entries(v1LayerCache).forEach(([areaId, path]) => {
        if (!v2Cache[layerId]) {
          v2Cache[layerId] = {};
        }
        v2Cache[layerId][areaId] = {
          progress: 100,
          completed: true,
          requested: false,
          error: false
        };
      });
    });

  return v2Cache;
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
// eslint-disable-next-line import/no-unused-modules
export const migrateRouteStateFromV1ToV2 = (
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
        hasMigratedV1Files: false,
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
        cache: undefined, // Removed key
        cacheStatus: undefined, // Removed key
        // Different types of layers can now be held in state.layers.data, but everything migrated from v1 will be contextual layer
        data: state.layers.data.map(layer => ({
          ...layer,
          type: 'contextual_layer'
        })),
        downloadedLayerProgress: migrateLayerCacheStateFromV1ToV2(state.layers.cache),
        layersProgress: undefined, // Removed key
        pendingCache: undefined // Removed key
      },
      routes: migrateRouteStateFromV1ToV2(state.routes, state.areas.data)
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
