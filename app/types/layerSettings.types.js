// @flow

import type { FilterThreshold } from 'types/alerts.types';

/**
 * Just to understand better, as the flow type may be confusing,
 * the layer settings redux module state will be of this shape:
 * {
 *   area_id_1: {
 *    reports: {...}, basemap: {...}, ...
 *   },
 *   area_id_2: {
 *    reports: {...}, basemap: {...}, ...
 *   }
 *   route_id_1: {
 *    reports: {...}, basemap: {...}, ...
 *   },
 *   ...
 * }
 */

export type AlertLayerSettingsType = {
  layerIsActive: boolean,
  initialised: boolean,
  deforestation: {
    timeFrame: FilterThreshold,
    activeSlugs: Array<string>
  },
  fires: {
    timeFrame: FilterThreshold,
    activeSlugs: Array<string>
  }
};

export type ContextualLayerSettingsType = {
  layerIsActive: boolean,
  activeContextualLayerIds: Array<string>
};

export type RoutesLayerSettingsType = {
  showAll: boolean,
  layerIsActive: boolean,
  activeRouteIds: Array<string>
};

export type LayerSettingsState = { [featureId: string]: LayerSettings };
export type LayerSettings = {
  reports: {
    layerIsActive: boolean,
    myReportsActive: boolean,
    importedReportsActive: boolean
  },
  basemap: {
    activeBasemapId: string
  },
  routes: RoutesLayerSettingsType,
  alerts: AlertLayerSettingsType,
  contextualLayers: ContextualLayerSettingsType
};

export type LayerSettingsAction =
  | ClearEnabledAlertTypes
  | ClearEnabledContextualLayers
  | SetContextualLayerShowing
  | ToggleAlertsLayer
  | ToggleRoutesLayer
  | ToggleReportsLayer
  | ToggleMyReportsLayer
  | EnableRoutesLayer
  | ToggleImportedReportsLayer
  | ToggleContextualLayersLayer
  | InitialiseAlerts
  | ToggleAlertsCategoryAlerts
  | SetAlertsCategoryAlertsTimeFrame
  | CopyLayerSettings
  | DeselectAllRoutes
  | ToggleRouteSelected
  | ShowSavedRoute
  | UnselectDeletedBasemap
  | SelectActiveBasemap;

export type ClearEnabledAlertTypes = {
  type: 'layerSettings/CLEAR_ENABLED_ALERT_TYPES',
  payload: {
    featureId: string
  }
};
export type ClearEnabledContextualLayers = {
  type: 'layerSettings/CLEAR_ENABLED_CONTEXTUAL_LAYERS',
  payload: {
    featureId: string
  }
};
export type ToggleAlertsLayer = {
  type: 'layerSettings/TOGGLE_ALERTS_LAYER',
  payload: {
    featureId: string
  }
};
export type ToggleRoutesLayer = {
  type: 'layerSettings/TOGGLE_ROUTES_LAYER',
  payload: {
    featureId: string
  }
};
export type ToggleReportsLayer = {
  type: 'layerSettings/TOGGLE_REPORTS_LAYER',
  payload: {
    featureId: string
  }
};
export type ToggleContextualLayersLayer = {
  type: 'layerSettings/TOGGLE_CONTEXTUAL_LAYERS_LAYER',
  payload: {
    featureId: string
  }
};
export type ToggleMyReportsLayer = {
  type: 'layerSettings/TOGGLE_MY_REPORTS_LAYER',
  payload: {
    featureId: string
  }
};
export type ToggleImportedReportsLayer = {
  type: 'layerSettings/TOGGLE_IMPORTED_REPORTS_LAYER',
  payload: {
    featureId: string
  }
};
export type EnableRoutesLayer = {
  type: 'layerSettings/ENABLE_ROUTES_LAYER',
  payload: {
    featureId: string
  }
};

export type InitialiseAlerts = {
  type: 'layerSettings/INITIALISE_ALERTS',
  payload: {
    featureId: string,
    showDeforestation: boolean,
    showFires: boolean
  }
};
export type ToggleAlertsCategoryAlerts = {
  type: 'layerSettings/TOGGLE_ALERTS_CATEGORY_ALERTS',
  payload: {
    featureId: string,
    categoryId: string
  }
};
export type ToggleAlertsDataset = {
  type: 'layerSettings/TOGGLE_ALERTS_DATASET',
  payload: {
    featureId: string,
    categoryId: string,
    slug: string
  }
};
export type SetAlertsCategoryAlertsTimeFrame = {
  type: 'layerSettings/SET_ALERTS_CATEGORY_ALERTS_TIME_FRAME',
  payload: {
    featureId: string,
    timeFrame: FilterThreshold,
    categoryId: string
  }
};
export type SelectActiveBasemap = {
  type: 'layerSettings/SELECT_ACTIVE_BASEMAP',
  payload: {
    featureId: string,
    basemapId: string
  }
};
export type CopyLayerSettings = {
  type: 'layerSettings/COPY_LAYER_SETTINGS',
  payload: {
    copyFromFeatureId: string,
    featureId: string
  }
};
export type SetContextualLayerShowing = {
  type: 'layerSettings/SET_CONTEXTUAL_LAYER_SHOWING',
  payload: {
    featureId: string,
    layerId: string,
    showing: boolean
  }
};
export type DeselectAllRoutes = {
  type: 'layerSettings/DESELECT_ALL_ROUTES',
  payload: {
    featureId: string
  }
};
export type ToggleRouteSelected = {
  type: 'layerSettings/TOGGLE_ROUTE_SELECTED',
  payload: {
    featureId: string,
    routeId: string
  }
};

export type UnselectDeletedBasemap = {
  type: 'layerSettings/UNSELECT_DELETED_BASEMAP',
  payload: string
};

export type ShowSavedRoute = {
  type: 'layerSettings/SHOW_SAVED_ROUTE',
  payload: {
    featureId: string,
    routeId: string
  }
};
