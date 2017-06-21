import Config from 'react-native-config';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';

export const GET_GEOSTORE_REQUEST = 'gesotore/GET_GEOSTORE_REQUEST';
export const GET_GEOSTORE_COMMIT = 'gesotore/GET_GEOSTORE_COMMIT';
const GET_GEOSTORE_ROLLBACK = 'gesotore/GET_GEOSTORE_ROLLBACK';
const STORE_GEOSTORE = 'geostore/STORE_GEOSTORE';

// Reducer
const initialState = {
  data: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case STORE_GEOSTORE: {
      const data = Object.assign({}, state.data, {});
      if (!data[action.payload.id]) {
        data[action.payload.id] = action.payload;
      }

      return Object.assign({}, state, { data });
    }
    case GET_GEOSTORE_COMMIT: {
      const data = Object.assign({}, state.data, {});
      data[action.payload.id] = action.payload;
      return { ...state, data };
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      return state;
  }
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
