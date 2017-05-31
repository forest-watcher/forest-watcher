import Config from 'react-native-config';

// Actions
import { LOGOUT_COMMIT } from 'redux-modules/user';

const STORE_GEOSTORE = 'geostore/STORE_GEOSTORE';

// Reducer
const initialState = {
  data: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case STORE_GEOSTORE: {
      const geostoreList = Object.assign({}, state.data, {});
      if (!geostoreList[action.payload.id]) {
        geostoreList[action.payload.id] = action.payload.data;
      }

      return Object.assign({}, state, { data: geostoreList });
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
  return (dispatch, state) => {
    fetch(url, {
      headers: {
        Authorization: `Bearer ${state().user.token}`
      }
    })
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((response) => {
        dispatch({
          type: STORE_GEOSTORE,
          payload: {
            id: response.data.id,
            data: response.data.attributes.geojson
          }
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}
