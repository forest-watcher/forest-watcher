// Prepared for the API
// import Config from 'react-native-config'

// TEMP
import data from 'config/fakeData/alerts.json';

// Actions
const GET_ALERTS = 'alerts/GET_ALERTS';

// Reducer
const initialState = {
  data: []
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALERTS:
      return Object.assign({}, state, { data: action.payload.data });
    default:
      return state;
  }
}

// Action Creators
export function getAlerts() {
  // Prepared for the API
  // const url = `${Config.API_URL}/alerts`;
  // return (dispatch) => {
  //   fetch(url)
  //     .then(response => response.json())
  //     .then((data) => {
  //       dispatch({
  //         type: GET_ALERTS,
  //         payload: data
  //       });
  //     });
  // };
  return (dispatch) => {
    dispatch({
      type: GET_ALERTS,
      payload: data
    });
  };
}
