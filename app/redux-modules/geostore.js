import Config from 'react-native-config';

// Actions
import { LOGOUT_COMMIT } from 'redux-modules/user';

const GET_GEOSTORE_REQUEST = 'gesotore/GET_GEOSTORE_REQUEST';
const GET_GEOSTORE_COMMIT = 'gesotore/GET_GEOSTORE_COMMIT';
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
        data[action.payload.id] = action.payload.data;
      }

      return Object.assign({}, state, { data });
    }
    case GET_GEOSTORE_COMMIT: {
      const data = Object.assign({}, state.data, {});
      data[action.payload.id] = action.payload;
      return { ...state, data };
    }
    case LOGOUT_COMMIT: {
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

export function getGeostore(id) {
  const url = `${Config.API_URL}/geostore/${id}`;
  return {
    type: GET_GEOSTORE_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: { type: GET_GEOSTORE_COMMIT },
        rollback: { type: GET_GEOSTORE_ROLLBACK }
      }
    }
  };
}
