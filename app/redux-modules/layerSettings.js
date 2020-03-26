// @flow
import type { LayerSettingsState, LayerSettingsAction } from 'types/layerSettings.types';

// Actions
const TOGGLE_ALERTS_LAYER = 'layerSettings/TOGGLE_ALERTS_LAYER';
const TOGGLE_ROUTES_LAYER = 'layerSettings/TOGGLE_ROUTES_LAYER';
const TOGGLE_REPORTS_LAYER = 'layerSettings/TOGGLE_REPORTS_LAYER';
const TOGGLE_CONTEXTUAL_LAYERS_LAYER = 'layerSettings/TOGGLE_CONTEXTUAL_LAYERS_LAYER';

const DEFAULT_BASEMAP = ""; // TODO

// Reducer
const initialState = {
  alerts: {
    layerIsActive: true,
    glad: {
      active: false,
      timeframeMonths: 1
    },
    viirs: {
      active: false,
      timeframeMonths: 1
    }
  },
  routes: {
    layerIsActive: false,
    activeRouteIds: []
  },
  reports: {
    layerIsActive: false, // todo becomes false if other two are false
    myReportsActive: false,
    importedReportsActive: false
  },
  contextualLayers: {
    layerIsActive: false,
    activeContextualLayerIds: []
  },
  basemap: {
    activeBasemapId: DEFAULT_BASEMAP
  }
};

export default function reducer(state: LayerSettingsState = initialState, action: LayerSettingsAction): SetupState {
  switch (action.type) {
    case TOGGLE_ALERTS_LAYER: {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          layerIsActive: !state.alerts.layerIsActive
        }
      };
    }
    case TOGGLE_ROUTES_LAYER: {
      return {
        ...state,
        routes: {
          ...state.routes,
          layerIsActive: !state.routes.layerIsActive
        }
      };
    }
    case TOGGLE_REPORTS_LAYER: {
      return {
        ...state,
        reports: {
          ...state.reports,
          layerIsActive: !state.reports.layerIsActive
        }
      };
    }
    case TOGGLE_CONTEXTUAL_LAYERS_LAYER: {
      return {
        ...state,
        contextualLayers: {
          ...state.contextualLayers,
          layerIsActive: !state.contextualLayers.layerIsActive
        }
      };
    }
    default:
      return state;
  }
}

export function toggleAlertsLayer(): LayerSettingsAction {
  return {
    type: TOGGLE_ALERTS_LAYER
  };
}

export function toggleRoutesLayer(): LayerSettingsAction {
  return {
    type: TOGGLE_ROUTES_LAYER
  };
}

export function toggleReportsLayer(): LayerSettingsAction {
  return {
    type: TOGGLE_REPORTS_LAYER
  };
}

export function toggleContextualLayersLayer(): LayerSettingsAction {
  return {
    type: TOGGLE_CONTEXTUAL_LAYERS_LAYER
  };
}
