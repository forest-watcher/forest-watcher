import Config from 'react-native-config';

import { LOGOUT_REQUEST } from 'redux-modules/user';

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';
const SET_ACTIVE_LAYER = 'layer/SET_ACTIVE_LAYER';

// Reducer
const initialState = {
  data: [],
  synced: false,
  syncing: false,
  activeLayer: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_LAYERS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_LAYERS_COMMIT: {
      const data = [...action.payload];
      return { ...state, data, synced: true, syncing: false };
    }
    case GET_LAYERS_ROLLBACK: {
      const data = [...action.meta.layers];
      return { ...state, data, syncing: false };
    }
    case SET_ACTIVE_LAYER:
      return { ...state, activeLayer: action.payload };
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

export function getUserLayers() {
  return (dispatch, state) => {
    const layers = state().layers.data;
    const url = `${Config.API_URL}/contextual-layer`;
    return dispatch({
      type: GET_LAYERS_REQUEST,
      meta: {
        offline: {
          effect: { url },
          commit: { type: GET_LAYERS_COMMIT },
          rollback: { type: GET_LAYERS_ROLLBACK, meta: { layers } }
        }
      }
    });
  };
}

export function setActiveContextualLayer(layerId, value) {
  return (dispatch, state) => {
    let activeLayer = null;
    if (layerId !== state().layers.activeLayer && value) activeLayer = layerId;
    return dispatch({ type: SET_ACTIVE_LAYER, payload: activeLayer });
  };
}
