// @flow

export type LayerSettingsState = {
  reports: {
    layerIsActive: boolean,
    myReportsActive: boolean,
    importedReportsActive: boolean
  },
  basemap: {
    activeBasemapId: string
  },
  routes: {
    layerIsActive: boolean,
    activeRouteIds: Array<string>
  },
  alerts: {
    layerIsActive: boolean,
    glad: {
      active: boolean,
      timeFrame: number
    },
    viirs: {
      active: boolean,
      timeFrame: number
    }
  },
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
  | ToggleContextualLayersLayer
  | ToggleGladAlerts
  | ToggleViirsAlerts
  | SetGladAlertsTimeFrame
  | SetViirsAlertsTimeFrame
  | SelectActiveBasemap;

export type ClearEnabledContextualLayers = { type: 'layerSettings/CLEAR_ENABLED_CONTEXTUAL_LAYERS' };
export type ToggleAlertsLayer = { type: 'layerSettings/TOGGLE_ALERTS_LAYER' };
export type ToggleRoutesLayer = { type: 'layerSettings/TOGGLE_ROUTES_LAYER' };
export type ToggleReportsLayer = { type: 'layerSettings/TOGGLE_REPORTS_LAYER' };
export type ToggleContextualLayersLayer = { type: 'layerSettings/TOGGLE_CONTEXTUAL_LAYERS_LAYER' };
export type ToggleGladAlerts = { type: 'layerSettings/TOGGLE_GLAD_ALERTS' };
export type ToggleViirsAlerts = { type: 'layerSettings/TOGGLE_VIIRS_ALERTS' };
export type SetGladAlertsTimeFrame = {
  type: 'layerSettings/SET_GLAD_ALERTS_TIME_FRAME',
  payload: {
    timeFrame: number
  }
};
export type SetViirsAlertsTimeFrame = {
  type: 'layerSettings/SET_VIIRS_ALERTS_TIME_FRAME',
  payload: {
    timeFrame: number
  }
};
export type SelectActiveBasemap = {
  type: 'layerSettings/SELECT_ACTIVE_BASEMAP',
  payload: {
    basemapId: string
  }
};
export type SetContextualLayerShowing = {
  type: 'layerSettings/SET_CONTEXTUAL_LAYER_SHOWING',
  payload: {
    layerId: string,
    showing: boolean
  }
};
