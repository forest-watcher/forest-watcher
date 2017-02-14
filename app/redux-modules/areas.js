import Config from 'react-native-config';

// Actions
import { SET_AREA_SAVED } from 'redux-modules/setup';

const GET_AREAS = 'areas/GET_AREAS';
const SAVE_AREA = 'areas/SAVE_AREA';

// Reducer
const initialState = {
  data: [],
  images: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS:
      return Object.assign({}, state, { ...action.payload });
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
      .then(response => response.json())
      .then((data) => {
        dispatch({
          type: GET_AREAS,
          payload: data
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
      body: JSON.stringify(params)
    };
    fetch(url, fetchConfig)
      .then(response => response.json())
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
