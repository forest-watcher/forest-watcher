import Config from 'react-native-config';
import BoundingBox from 'boundingbox';
// Actions
import { LOGOUT } from 'redux-modules/user';

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
    case LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
}

// Action Creators
export function getAlerts(areaId) {
  const url = `${Config.API_STAGING_URL}/area/${areaId}/alerts?precissionPoints=6&precissionBBOX=4&nogenerate=true`;

  return async (dispatch, state) => {
    let alerts = await fetch(url,
      {
        headers: {
          Authorization: `Bearer ${state().user.token}`
        }
      })
    .then(response => {
      if (response.ok) return response.json();
      throw Error(response.statusText);
    })
    .catch((error) => {
      console.warn(error);
      // To-do
    });

    if (alerts) {
      alerts = alerts.map((alert) => {
        const currentAlert = alert;
        const bbox = new BoundingBox({
          minlat: currentAlert.bbox[1],
          minlon: currentAlert.bbox[0],
          maxlat: currentAlert.bbox[3],
          maxlon: currentAlert.bbox[2]
        });
        currentAlert.center = bbox.getCenter();
        return alert;
      });
    }
    dispatch({
      type: GET_ALERTS,
      payload: {
        area: areaId,
        alerts
      }
    });
  };
}
