// @flow
import type { Area } from 'types/areas.types';
import type { LayerDownloadProgress } from 'types/layers.types';
import type { Route, RouteState } from 'types/routes.types';
import type { Dispatch, State } from 'types/store.types';

import createMigration from 'redux-persist-migrate';
import generateUniqueID from 'helpers/uniqueId';
import { migrateReportAttachmentsFromV1ToV2 } from 'redux-modules/reports';
import migrateLayerFilesFromV1ToV2 from 'helpers/layer-store/migrateLayerFilesFromV1ToV2';

import { DATASET_CATEGORIES } from 'config/constants';

export const CURRENT_REDUX_STATE_VERSION = 3;

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
          error: null
        };
      });
    });

  return v2Cache;
};

/**
 * v3 layer settings state uses dataset categories (i.e. deforestation contains GLAD, GLAD+ and RADD) so we need to
 * migrate the old layer settings state when time intervals e.t.c were at the slug level (GLAD) to be at the category level
 */
const migrateLayerSettingsStateFromV2ToV3 = (v2LayerSettings: { [featureId: string]: any }): LayerSettingsState => {
  const v3LayerSettings: LayerSettingsState = {};
  if (!v2LayerSettings) {
    return v3LayerSettings;
  }

  // For each featureId in old settings (featureId === area id)
  Object.entries(v2LayerSettings).forEach(([featureId, v2LayerSetting]) => {
    // Get old alert settings
    const v2LayerAlertSettings = v2LayerSetting.alerts;
    const v3LayerAlertSettings = { ...v2LayerSetting.alerts };

    // If glad is present on old settings, setup `deforestation` category
    // using `glad` and then delete from settings object to clear up state
    if (v2LayerAlertSettings.glad) {
      v3LayerAlertSettings['deforestation'] = {
        activeSlugs: v2LayerAlertSettings.glad.active ? DATASET_CATEGORIES.deforestation.datasetSlugs : [],
        timeFrame: {
          units: 'months', // No longer in a constant, but as this is a 1 time
          // migration, we're fine to hard-code
          value: v2LayerAlertSettings.glad.timeFrame
        }
      };
      // Get rid of old GLAD settings!
      delete v3LayerAlertSettings['glad'];
    }

    // If viirs is present on old settings, setup `fires` category
    // using `viirs` and then delete from settings object to clear up state
    if (v2LayerAlertSettings.viirs) {
      v3LayerAlertSettings['fires'] = {
        activeSlugs: v2LayerAlertSettings.viirs.active ? DATASET_CATEGORIES.fires.datasetSlugs : [],
        timeFrame: {
          units: 'days', // No longer in a constant, but as this is a 1 time
          // migration, we're fine to hard-code
          value: v2LayerAlertSettings.viirs.timeFrame
        }
      };
      // Get rid of old VIIRS settings!
      delete v3LayerAlertSettings['viirs'];
    }

    // re-construct layer settings object
    const v3LayerSetting = {
      ...v2LayerSetting,
      alerts: v3LayerAlertSettings
    };
    // Re-assign the layer settings for the current feature id
    v3LayerSettings[featureId] = v3LayerSetting;
  });
  return v3LayerSettings;
};

/**
 * migrateV1RoutesToV2RoutesStructure - given the existing route state & the available areas,
 * attempts to reconcile routes against areas to find the relevant geostoreIds, so the routes
 * are downloadable later on. This will also migrate any of the old route IDs to use a UUID.
 *
 * If the route state doesn't exist / is invalid, undefined will be returned, leading to the initial state being used.
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
  },
  3: (state: State): State => {
    console.warn('3SC', 'Migrate Redux state to v3');
    const { app, layerSettings } = state;
    // Only set welcomeSeenVersion if the user has actually seen it!
    if (app.hasSeenWelcomeScreen) {
      app.welcomeSeenVersion = '2.0.4'; // Doesn't matter if user actually saw it on an older version as we only need this
      // value in versions post 2.1.0
    }
    return {
      ...state,
      app,
      layerSettings: migrateLayerSettingsStateFromV2ToV3(layerSettings)
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
