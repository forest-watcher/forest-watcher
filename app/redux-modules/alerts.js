import Config from 'react-native-config';
import BoundingBox from 'boundingbox';
import intersect from 'turf-intersect';

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
export function getAlerts(areaId, geojson) {
  const url = `${Config.API_STAGING_URL}/area/${areaId}/alerts?precissionPoints=6&precissionBBOX=4&nogenerate=true`;

  return async (dispatch, state) => {
    const alerts = await fetch(url,
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

    const areaGeojson = geojson.features[0];

    if (alerts) {
      await Promise.all(alerts.map(async (alert) => {
        const currentAlert = alert;
        currentAlert.coordinates = [];
        const bbox = new BoundingBox({
          minlat: currentAlert.bbox[1],
          minlon: currentAlert.bbox[0],
          maxlat: currentAlert.bbox[3],
          maxlon: currentAlert.bbox[2]
        });
        const geoJson = bbox.toGeoJSON();
        const intersection = intersect(geoJson, areaGeojson);
        const geom = JSON.stringify(intersection.geometry);

        if (alert.countGlad > 0) {
          const dataset = Config.DATASET_GLAD;
          const urlPoints = `${Config.API_STAGING_URL}/query/${dataset}/?sql=
          select lat, long from data
          where year >= 2017
          AND st_intersects(st_setsrid(st_geomfromgeojson('${geom}'), 4326), the_geom) LIMIT 60`;

          const points = await fetch(urlPoints)
            .then(response => {
              if (response.ok) return response.json();
              throw Error(response.statusText);
            })
            .then(res => res.data)
            .catch((error) => {
              console.warn(error);
              // To-do
            });

          if (points) {
            points.map((point, key) => {
              const newPoint = point;
              newPoint.id = `glad-${key}`;
              newPoint.type = 'glad';
              return newPoint;
            });
            currentAlert.coordinates = [...currentAlert.coordinates, ...points];
          }
        }

        if (alert.countViirs > 0) {
          const dataset = Config.DATASET_VIIRS;
          const urlPoints = `${Config.API_URL}/query/${dataset}/?sql=
          select ST_X(the_geom) as long, ST_Y(the_geom) as lat from ${Config.TABLE_VIIRS}
          where acq_date >= '2017-01-01'
          AND st_intersects(st_setsrid(st_geomfromgeojson('${geom}'), 4326), the_geom) LIMIT 60`;


          const points = await fetch(urlPoints)
            .then(response => {
              if (response.ok) return response.json();
              throw Error(response.statusText);
            })
            .then(res => res.data)
            .catch((error) => {
              console.warn(error);
              // To-do
            });

          if (points) {
            points.map((point, key) => {
              const newPoint = point;
              newPoint.id = `viirs-${key}`;
              newPoint.type = 'viirs';
              return newPoint;
            });
            currentAlert.coordinates = [...currentAlert.coordinates, ...points];
          }
        }

        currentAlert.geojson = geojson;
        currentAlert.center = bbox.getCenter();
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
