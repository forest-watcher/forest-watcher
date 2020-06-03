// @flow

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
  glad: {
    active: boolean,
    timeFrame: number
  },
  viirs: {
    active: boolean,
    timeFrame: number
  }
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
  contextualLayers: {
    layerIsActive: boolean,
    activeContextualLayerIds: Array<string>
  }
};

export type LayerSettingsAction =
  | ClearEnabledContextualLayers
  | SetContextualLayerShowing
  | ToggleAlertsLayer
  | ToggleRoutesLayer
  | ToggleReportsLayer
  | ToggleMyReportsLayer
  | ToggleImportedReportsLayer
  | ToggleContextualLayersLayer
  | InitialiseAlerts
  | ToggleGladAlerts
  | ToggleViirsAlerts
  | SetGladAlertsTimeFrame
  | SetViirsAlertsTimeFrame
  | CopyLayerSettings
  | DeselectAllRoutes
  | ToggleRouteSelected
  | ShowSavedRoute
  | SelectActiveBasemap;

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
export type InitialiseAlerts = {
  type: 'layerSettings/INITIALISE_ALERTS',
  payload: {
    featureId: string,
    showGlad: boolean,
    showViirs: boolean
  }
};
export type ToggleGladAlerts = {
  type: 'layerSettings/TOGGLE_GLAD_ALERTS',
  payload: {
    featureId: string
  }
};
export type ToggleViirsAlerts = {
  type: 'layerSettings/TOGGLE_VIIRS_ALERTS',
  payload: {
    featureId: string
  }
};
export type SetGladAlertsTimeFrame = {
  type: 'layerSettings/SET_GLAD_ALERTS_TIME_FRAME',
  payload: {
    featureId: string,
    timeFrame: number
  }
};
export type SetViirsAlertsTimeFrame = {
  type: 'layerSettings/SET_VIIRS_ALERTS_TIME_FRAME',
  payload: {
    featureId: string,
    timeFrame: number
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

export type ShowSavedRoute = {
  type: 'layerSettings/SHOW_SAVED_ROUTE',
  payload: {
    featureId: string,
    routeId: string
  }
};
