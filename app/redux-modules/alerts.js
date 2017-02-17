import Config from 'react-native-config';

// Actions
const GET_ALERTS = 'alerts/GET_ALERTS';

// Reducer
const initialState = {
  data: {}
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_ALERTS: {
      const alertsList = Object.assign({}, state.data, {});
      if (!alertsList[action.payload.area]) {
        alertsList[action.payload.area] = action.payload.alerts;
      }

      return Object.assign({}, state, { data: alertsList });
    }
    default:
      return state;
  }
}

// Action Creators
export function getAlerts(areaId) {
  const url = `${Config.API_URL}/area/${areaId}/alerts?precissionPoints=6&precissionBBOX=4`;
  return (dispatch, state) => {
    fetch(url, {
      headers: {
        Authorization: `Bearer ${state().user.token}`
      }
    })
      .then(response => response.json())
      .then((data) => {
        dispatch({
          type: GET_ALERTS,
          payload: {
            area: areaId,
            alerts: data
          }
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}
