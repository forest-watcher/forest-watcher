// @flow
import type { LayerSettingsState, LayerSettingsAction } from 'types/layerSettings.types';
import { DEFAULT_BASEMAP } from 'redux-modules/basemaps';

// Actions
const TOGGLE_ALERTS_LAYER = 'layerSettings/TOGGLE_ALERTS_LAYER';
const TOGGLE_ROUTES_LAYER = 'layerSettings/TOGGLE_ROUTES_LAYER';
const TOGGLE_REPORTS_LAYER = 'layerSettings/TOGGLE_REPORTS_LAYER';
const TOGGLE_CONTEXTUAL_LAYERS_LAYER = 'layerSettings/TOGGLE_CONTEXTUAL_LAYERS_LAYER';

const TOGGLE_MY_REPORTS_LAYER = 'layerSettings/TOGGLE_MY_REPORTS_LAYER';
const TOGGLE_IMPORTED_REPORTS_LAYER = 'layerSettings/TOGGLE_IMPORTED_REPORTS_LAYER';

const TOGGLE_GLAD_ALERTS = 'layerSettings/TOGGLE_GLAD_ALERTS';
const TOGGLE_VIIRS_ALERTS = 'layerSettings/TOGGLE_VIIRS_ALERTS';
const SET_GLAD_ALERTS_TIME_FRAME = 'layerSettings/SET_GLAD_ALERTS_TIME_FRAME';
const SET_VIIRS_ALERTS_TIME_FRAME = 'layerSettings/SET_VIIRS_ALERTS_TIME_FRAME';

const SELECT_ACTIVE_BASEMAP = 'layerSettings/SELECT_ACTIVE_BASEMAP';

// Reducer
const initialState = {
  alerts: {
    layerIsActive: true,
    glad: {
      active: false,
      timeFrame: 1
    },
    viirs: {
      active: false,
      timeFrame: 1
    }
  },
  routes: {
    layerIsActive: false,
    activeRouteIds: []
  },
  reports: {
    layerIsActive: false,
    myReportsActive: false,
    importedReportsActive: false
  },
  contextualLayers: {
    layerIsActive: false,
    activeContextualLayerIds: []
  },
  basemap: {
    activeBasemapId: DEFAULT_BASEMAP.id
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
    case TOGGLE_GLAD_ALERTS: {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          glad: {
            ...state.alerts.glad,
            active: !state.alerts.glad.active
          }
        }
      };
    }
    case TOGGLE_VIIRS_ALERTS: {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          viirs: {
            ...state.alerts.viirs,
            active: !state.alerts.viirs.active
          }
        }
      };
    }
    case SET_GLAD_ALERTS_TIME_FRAME: {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          glad: {
            ...state.alerts.glad,
            timeFrame: action.payload.timeFrame
          }
        }
      };
    }
    case SET_VIIRS_ALERTS_TIME_FRAME: {
      return {
        ...state,
        alerts: {
          ...state.alerts,
          viirs: {
            ...state.alerts.viirs,
            timeFrame: action.payload.timeFrame
          }
        }
      };
    }
    case SELECT_ACTIVE_BASEMAP: {
      return { ...state, basemap: { activeBasemapId: action.payload.basemapId } };
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

export function toggleGladAlerts(): LayerSettingsAction {
  return {
    type: TOGGLE_GLAD_ALERTS
  };
}

export function toggleViirsAlerts(): LayerSettingsAction {
  return {
    type: TOGGLE_VIIRS_ALERTS
  };
}

export function setGladAlertsTimeFrame(timeFrame: number): LayerSettingsAction {
  return {
    type: SET_GLAD_ALERTS_TIME_FRAME,
    payload: {
      timeFrame
    }
  };
}

export function setViirsAlertsTimeFrame(timeFrame: number): LayerSettingsAction {
  return {
    type: SET_VIIRS_ALERTS_TIME_FRAME,
    payload: {
      timeFrame
    }
  };
}

export function selectActiveBasemap(basemapId: string): LayerSettingsAction {
  return {
    type: SELECT_ACTIVE_BASEMAP,
    payload: {
      basemapId
    }
  };
}

export function getActiveBasemap(state) {
  const activeBasemapId = state.layerSettings.basemap.activeBasemapId;
  const allBasemaps = [...state.basemaps.gfwBasemaps, ...state.basemaps.importedBasemaps];
  return allBasemaps.find(item => item.id === activeBasemapId);
}
