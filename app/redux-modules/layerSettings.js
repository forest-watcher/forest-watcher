// @flow
import type { LayerSettingsState, LayerSettingsAction } from 'types/layerSettings.types';

import remove from 'lodash/remove';

// Actions
const TOGGLE_ALERTS_LAYER = 'layerSettings/TOGGLE_ALERTS_LAYER';
const TOGGLE_ROUTES_LAYER = 'layerSettings/TOGGLE_ROUTES_LAYER';
const TOGGLE_REPORTS_LAYER = 'layerSettings/TOGGLE_REPORTS_LAYER';
const TOGGLE_CONTEXTUAL_LAYERS_LAYER = 'layerSettings/TOGGLE_CONTEXTUAL_LAYERS_LAYER';

const TOGGLE_MY_REPORTS_LAYER = 'layerSettings/TOGGLE_MY_REPORTS_LAYER';
const TOGGLE_IMPORTED_REPORTS_LAYER = 'layerSettings/TOGGLE_IMPORTED_REPORTS_LAYER';

const SET_CONTEXTUAL_LAYER_SHOWING = 'layerSettings/SET_CONTEXTUAL_LAYER_SHOWING';
const CLEAR_ENABLED_CONTEXTUAL_LAYERS = 'layerSettings/CLEAR_ENABLED_CONTEXTUAL_LAYERS';

const DEFAULT_BASEMAP = ''; // TODO

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
    case TOGGLE_MY_REPORTS_LAYER: {
      return {
        ...state,
        reports: {
          ...state.reports,
          myReportsActive: !state.reports.myReportsActive
        }
      };
    }
    case TOGGLE_IMPORTED_REPORTS_LAYER: {
      return {
        ...state,
        reports: {
          ...state.reports,
          importedReportsActive: !state.reports.importedReportsActive
        }
      };
    }
    case SET_CONTEXTUAL_LAYER_SHOWING: {
      const activeContextualLayerIds = [...state.contextualLayers.activeContextualLayerIds];
      if (action.payload.showing && !activeContextualLayerIds.includes(action.payload.layerId)) {
        activeContextualLayerIds.push(action.payload.layerId);
      } else if (!action.payload.showing) {
        remove(activeContextualLayerIds, layerId => {
          return layerId === action.payload.layerId;
        });
      }
      return {
        ...state,
        contextualLayers: {
          ...state.contextualLayers,
          activeContextualLayerIds
        }
      };
    }
    case CLEAR_ENABLED_CONTEXTUAL_LAYERS: {
      return {
        ...state,
        contextualLayers: {
          ...state.contextualLayers,
          activeContextualLayerIds: []
        }
      };
    }
    default:
      return state;
  }
}

export function clearEnabledContextualLayers() {
  return {
    type: CLEAR_ENABLED_CONTEXTUAL_LAYERS
  };
}

export function setContextualLayerShowing(layerId: string, showing: boolean) {
  return {
    type: SET_CONTEXTUAL_LAYER_SHOWING,
    payload: {
      layerId,
      showing
    }
  };
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

export function toggleMyReportsLayer(): LayerSettingsAction {
  return {
    type: TOGGLE_MY_REPORTS_LAYER
  };
}

export function toggleImportedReportsLayer(): LayerSettingsAction {
  return {
    type: TOGGLE_IMPORTED_REPORTS_LAYER
  };
}
