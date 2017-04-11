import Config from 'react-native-config';
import { getGeostore } from 'redux-modules/geostore';

// Actions
import { SET_AREA_SAVED } from 'redux-modules/setup';
import { LOGOUT } from 'redux-modules/user';

const GET_AREAS = 'areas/GET_AREAS';
const SAVE_AREA = 'areas/SAVE_AREA';
const DELETE_AREA = 'areas/DELETE_AREA';

// Reducer
const initialState = {
  data: [],
  images: {},
  synced: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS:
      return Object.assign({}, state, { ...action.payload, synced: true });
    case SAVE_AREA: {
      const areas = state.data.length > 0 ? state.data : [];
      const image = {};

      image[action.payload.area.id] = action.payload.snapshot;
      areas.push(action.payload.area);

      const area = {
        data: areas,
        images: Object.assign({}, state.images, image)
      };

      return Object.assign({}, state, area);
    }
    case DELETE_AREA: {
      const areas = state.data.length > 0 ? state.data : [];
      const images = state.images.length > 0 ? state.images : [];
      const id = action.payload.id;
      const deletedArea = areas.find((a) => (a.id === id));
      areas.splice(areas.indexOf(deletedArea), 1);
      images.splice(images.indexOf(images[id]), 1);
      return Object.assign({}, state, { data: areas, images, synced: true });
    }
    case LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
}

// Action Creators
export function getAreas() {
  const url = `${Config.API_URL}/area`;
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
      .then(async (response) => {
        await Promise.all(response.data.map(async (area) => {
          if (area.attributes && area.attributes.geostore) {
            if (!state().geostore.data[area.attributes.geostore]) {
              await dispatch(getGeostore(area.attributes.geostore));
            }
          }
          return area;
        }));

        dispatch({
          type: GET_AREAS,
          payload: response
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}

export function saveArea(params) {
  const url = `${Config.API_URL}/area`;
  return (dispatch, state) => {
    const fetchConfig = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${state().user.token}`
      },
      body: JSON.stringify(params.area)
    };
    fetch(url, fetchConfig)
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((res) => {
        dispatch({
          type: SAVE_AREA,
          payload: {
            area: res.data,
            snapshot: params.snapshot
          }
        });
        dispatch({
          type: SET_AREA_SAVED,
          payload: true
        });
      })
      .catch((error) => {
        dispatch({
          type: SET_AREA_SAVED,
          payload: false
        });
        console.warn(error);
        // To-do
      });
  };
}

export function deleteArea(id) {
  const url = `${Config.API_URL}/area/${id}`;
  return (dispatch, state) => {
    const fetchConfig = {
      method: 'DELETE',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${state().user.token}`
      }
    };
    fetch(url, fetchConfig)
      .then(response => {
        if (response.ok && response.status === 204) return response.ok;
        throw Error(response.statusText);
      })
      .then(() => {
        dispatch({
          type: DELETE_AREA,
          payload: {
            id
          }
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}
