import Config from 'react-native-config';
import { getGeostore } from 'redux-modules/geostore';
import { getCachedImageByUrl } from 'helpers/fileManagement';

// Actions
import { SET_AREA_SAVED } from 'redux-modules/setup';
import { LOGOUT } from 'redux-modules/user';

const GET_AREAS = 'areas/GET_AREAS';
const SAVE_AREA = 'areas/SAVE_AREA';
const DELETE_AREA = 'areas/DELETE_AREA';
const SYNCING_AREAS = 'areas/SYNCING_AREA';
const UPDATE_DATE = 'areas/UPDATE_DATE';

// Reducer
const initialState = {
  data: [],
  images: {},
  synced: false,
  syncing: false,
  fromDate: null,
  toDate: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS:
      return Object.assign({}, state, { ...action.payload, synced: true });
    case SYNCING_AREAS:
      return Object.assign({}, state, { syncing: action.payload });
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
      const areas = state.data;
      const images = state.images;
      const id = action.payload.id;
      const deletedArea = areas.find((a) => (a.id === id));
      areas.splice(areas.indexOf(deletedArea), 1);
      if (images[id] !== undefined) { delete images[id]; }
      return Object.assign({}, state, { data: areas, images, synced: true });
    }
    case UPDATE_DATE:
      return Object.assign({}, state, { ...action.payload });
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
        throw new Error(response.statusText);
      })
      .then(async (response) => {
        const images = Object.assign({}, state().areas.images);
        await Promise.all(response.data.map(async (area) => {
          if (area.attributes && area.attributes.geostore) {
            if (!state().geostore.data[area.attributes.geostore]) {
              await dispatch(getGeostore(area.attributes.geostore));
            }
            if (!images[area.id]) {
              images[area.id] = await getCachedImageByUrl(area.attributes.image, 'areas');
            }
          }
          return area;
        }));

        dispatch({
          type: GET_AREAS,
          payload: {
            images,
            data: response.data
          }
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
    dispatch({
      type: SYNCING_AREAS,
      payload: true
    });
    const form = new FormData();
    form.append('name', params.area.name);
    form.append('geostore', params.area.geostore);
    const image = {
      uri: params.snapshot,
      type: 'image/png',
      name: `${params.area.name}.png`
    };
    form.append('image', image);

    const fetchConfig = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${state().user.token}`
      },
      body: form
    };

    fetch(url, fetchConfig)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error(response._bodyText); // eslint-disable-line
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
        dispatch({
          type: SYNCING_AREAS,
          payload: false
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
        throw new Error(response.statusText);
      })
      .then(() => {
        dispatch({
          type: SYNCING_AREAS,
          payload: true
        });
        dispatch({
          type: DELETE_AREA,
          payload: {
            id
          }
        });
        dispatch({
          type: SYNCING_AREAS,
          payload: false
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}

export function updateDate(date) {
  return {
    type: UPDATE_DATE,
    payload: date
  };
}
