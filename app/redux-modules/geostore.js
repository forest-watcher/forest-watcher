import Config from 'react-native-config';
import omit from 'lodash/omit';
import { getActionsTodoCount } from 'helpers/sync';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { GET_AREAS_COMMIT, SAVE_AREA_COMMIT } from 'redux-modules/areas';

const GET_GEOSTORE_REQUEST = 'geostore/GET_GEOSTORE_REQUEST';
export const GET_GEOSTORE_COMMIT = 'geostore/GET_GEOSTORE_COMMIT';
const GET_GEOSTORE_ROLLBACK = 'geostore/GET_GEOSTORE_ROLLBACK';
const STORE_GEOSTORE = 'geostore/STORE_GEOSTORE';

// Reducer
const initialState = {
  data: {},
  pendingData: {
    areas: {}
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case STORE_GEOSTORE: {
      const data = { ...state.data };
      if (!data[action.payload.id]) {
        data[action.payload.id] = action.payload;
      }
      return { ...state, data };
    }
    case GET_AREAS_COMMIT: {
      let pendingData = state.pendingData;
      const data = [...action.payload];
      data.forEach((area) => {
        pendingData = {
          areas: { ...pendingData.areas, [area.id]: false }
        };
      });
      return { ...state, pendingData };
    }
    case SAVE_AREA_COMMIT: {
      const area = action.payload;
      let pendingData = { ...state.pendingData };
      if (area) {
        pendingData = {
          areas: { ...pendingData.areas, [area.id]: false }
        };
      }
      return { ...state, pendingData };
    }
    case GET_GEOSTORE_REQUEST: {
      const area = action.payload;
      const pendingData = {
        ...state.pendingData,
        areas: {
          ...state.pendingData.areas, [area.id]: true
        }
      };
      return { ...state, pendingData };
    }
    case GET_GEOSTORE_COMMIT: {
      const data = { ...state.data };
      data[action.payload.id] = action.payload;

      const area = action.meta.area;
      const pendingData = {
        ...state.pendingData,
        areas: omit(state.pendingData.areas, [area.id])
      };
      return { ...state, data, pendingData };
    }
    case GET_GEOSTORE_ROLLBACK: {
      const area = action.payload;
      const pendingData = {
        ...state.pendingData,
        areas: {
          ...state.pendingData.areas, [area.id]: false
        }
      };
      return { ...state, pendingData };
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      return state;
  }
}

function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

// Action Creators
export function storeGeostore(id, data) {
  return dispatch => {
    // TODO: CHECK TO UNIFY ACTIONS
    dispatch({
      type: STORE_GEOSTORE,
      payload: {
        id,
        data
      }
    });
  };
}

export function getGeostore(area) {
  const url = `${Config.API_URL}/geostore/${area.geostore}`;
  return {
    type: GET_GEOSTORE_REQUEST,
    payload: area,
    meta: {
      offline: {
        effect: { url },
        commit: { type: GET_GEOSTORE_COMMIT, meta: { area } },
        rollback: { type: GET_GEOSTORE_ROLLBACK }
      }
    }
  };
}

export function getAreaGeostore(areaId) {
  return async (dispatch, state) => {
    const { areas, geostore } = state();
    const area = getAreaById(areas.data, areaId);
    const geostores = geostore.data;
    if (!geostores[area.geostore] || (geostores[area.geostore] && !geostores[area.geostore].data)) {
      dispatch(getGeostore(area));
    } else {
      dispatch({
        type: GET_GEOSTORE_COMMIT,
        payload: { ...geostores[area.geostore].data, id: area.geostore },
        meta: { area }
      });
    }
  };
}


export function syncGeostore() {
  return async (dispatch, state) => {
    const { pendingData } = state().geostore;
    if (getActionsTodoCount(pendingData) > 0) {
      Object.keys(pendingData).forEach((type) => {
        const syncingGeostoreData = pendingData[type];
        const canDispatch = id => (typeof syncingGeostoreData[id] !== 'undefined' && syncingGeostoreData[id] === false);
        const syncGeostoreData = (action) => {
          Object.keys(syncingGeostoreData).forEach(id => {
            if (canDispatch(id)) {
              action(id);
            }
          });
        };
        switch (type) {
          case 'areas':
            syncGeostoreData(id => dispatch(getAreaGeostore(id)));
            break;
          default:
        }
      });
    }
  };
}
