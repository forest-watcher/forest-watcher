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
      timeframeMonths: number
    },
    viirs: {
      active: boolean,
      timeframeMonths: number
    }
  },
  contextualLayers: {
    layerIsActive: boolean,
    activeContextualLayerIds: Array<string>
  }
};

export type LayerSettingsAction =
  | ToggleAlertsLayer
  | ToggleRoutesLayer
  | ToggleReportsLayer
  | ToggleContextualLayersLayer;

export type ToggleAlertsLayer = { type: 'layerSettings/TOGGLE_ALERTS_LAYER' };
export type ToggleRoutesLayer = { type: 'layerSettings/TOGGLE_ROUTES_LAYER' };
export type ToggleReportsLayer = { type: 'layerSettings/TOGGLE_REPORTS_LAYER' };
export type ToggleContextualLayersLayer = { type: 'layerSettings/TOGGLE_CONTEXTUAL_LAYERS_LAYER' };
