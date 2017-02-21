import Config from 'react-native-config';
import BoundingBox from 'boundingbox';

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
  return async (dispatch, state) => {
    const alerts = await fetch(url,
      {
        headers: {
          Authorization: `Bearer ${state().user.token}`
        }
      })
    .then(response => response.json())
    .catch((error) => {
      console.warn(error);
      // To-do
    });

    if (alerts) {
      await Promise.all(alerts.map(async (alert) => {
        const currentAlert = alert;
        const bbox = new BoundingBox({
          minlat: currentAlert.bbox[1],
          minlon: currentAlert.bbox[0],
          maxlat: currentAlert.bbox[3],
          maxlon: currentAlert.bbox[2]
        });
        const geojson = bbox.toGeoJSON();
        const geom = JSON.stringify(geojson.geometry);
        const urlPoints = `${Config.API_URL}/query/${Config.DATASET_GLAD}/?sql=
        select * from data
        where year >= '2017'
        AND st_intersects(st_setsrid(st_geomfromgeojson('${geom}'), 4326), the_geom)`;

        currentAlert.geojson = geojson;
        currentAlert.center = bbox.getCenter();
        currentAlert.coordinates = await fetch(urlPoints)
        .then(response => response.json())
        .then(res => res.data)
        .catch((error) => {
          console.warn(error);
          // To-do
        });

        return currentAlert;
      }));

      dispatch({
        type: GET_ALERTS,
        payload: {
          area: areaId,
          alerts
        }
      });
    }
  };
}
