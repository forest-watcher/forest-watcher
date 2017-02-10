import Config from 'react-native-config';

// Actions
const GET_AREAS = 'areas/GET_AREAS';
const SAVE_AREA = 'areas/SAVE_AREA';

// Reducer
const initialState = {
  data: null,
  images: null
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS:
      return Object.assign({}, state, { ...action.payload });
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
      .then((data) => {
        dispatch({
          type: SAVE_AREA,
          payload: data
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}
