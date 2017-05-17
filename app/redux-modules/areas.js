import Config from 'react-native-config';
import { getGeostore } from 'redux-modules/geostore';
import { getCachedImageByUrl, removeFolder } from 'helpers/fileManagement';
import { getBboxTiles, cacheTiles } from 'helpers/map';
import BoundingBox from 'boundingbox';
import CONSTANTS from 'config/constants';
import moment from 'moment';

// Actions
import { SET_AREA_SAVED } from 'redux-modules/setup';
import { LOGOUT } from 'redux-modules/user';

const GET_AREAS = 'areas/GET_AREAS';
const UPDATE_AREA = 'areas/UPDATE_AREA';
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
  fromDate: '20150101',
  toDate: moment().format('YYYYMMDD')
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS: {
      const areas = [...state.data];
      const images = action.payload.images;
      const newAreas = action.payload.data;
      let mergedAreas = [];
      if (areas.length > 0) {
        for (let i = 0, aLength = areas.length; i < aLength; i++) {
          for (let j = 0, naLength = newAreas.length; j < naLength; j++) {
            if (areas[i].id === areas[j].id) {
              mergedAreas.push({ ...areas[i], ...newAreas[j] });
            }
          }
        }
      } else {
        mergedAreas = newAreas;
      }
      return Object.assign({}, state, { data: mergedAreas, images, synced: true });
    }
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
    case UPDATE_AREA: {
      const areas = [...state.data];
      for (let i = 0, aLength = areas.length; i < aLength; i++) {
        if (areas[i].id === action.payload.id) {
          areas[i] = action.payload;
        }
      }

      return Object.assign({}, state, { data: areas });
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

// Helpers
function getAreaById(areas, areaId) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}
function updateDatasetCache(datasets, dataset, status) {
  return datasets.map((item) => {
    if (item.slug !== dataset) {
      return item;
    }
    return {
      ...item,
      options: item.options.map(option => (
        option.name === 'cache'
          ? { ...option, value: status }
          : option
      ))
    };
  });
}

// Action Creators
export function getAreas() {
  const url = `${Config.API_URL}/area`;
  return (dispatch, state) => {
    if (state().app.isConnected) {
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
    }
  };
}

export function updateArea(area) {
  const url = `${Config.API_URL}/area/${area.id}`;
  return (dispatch, state) => {
    const form = new FormData();
    form.append('name', area.attributes.name);

    const fetchConfig = {
      method: 'PATCH',
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
      .then(() => {
        dispatch({
          type: UPDATE_AREA,
          payload: area
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}


async function downloadArea(bbox, areaId, dataset) {
  const zooms = CONSTANTS.maps.cachedZoomLevels;
  const tilesArray = getBboxTiles(bbox, zooms);
  await cacheTiles(tilesArray, areaId, dataset);
}

export function saveArea(params) {
  const url = `${Config.API_URL}/area`;
  return (dispatch, state) => {
    if (state().app.isConnected) {
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
        .then(async (res) => {
          dispatch({
            type: SYNCING_AREAS,
            payload: false
          });
          dispatch({
            type: SAVE_AREA,
            payload: {
              area: res.data,
              snapshot: params.snapshot
            }
          });
          dispatch({
            type: SET_AREA_SAVED,
            payload: {
              status: true,
              areaId: res.data.id
            }
          });
        })
        .catch((error) => {
          dispatch({
            type: SET_AREA_SAVED,
            payload: {
              status: false
            }
          });
          console.warn(error);
          // To-do
        });
    }
  };
}

export function cacheArea(areaId, dataset) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const geojson = state().geostore.data[area.attributes.geostore];
      if (geojson) {
        area.datasets = updateDatasetCache(area.datasets, dataset, true);
        dispatch({
          type: UPDATE_AREA,
          payload: area
        });
        try {
          const bboxArea = new BoundingBox(geojson.features[0]);
          if (bboxArea) {
            const bbox = [
              { lat: bboxArea.minlat, lng: bboxArea.maxlon },
              { lat: bboxArea.maxlat, lng: bboxArea.minlon }
            ];
            await downloadArea(bbox, areaId, dataset);
          }
          console.info(`cache of ${dataset} is on`, area);
        } catch (e) {
          area.datasets = updateDatasetCache(area.datasets, dataset, false);
          dispatch({
            type: UPDATE_AREA,
            payload: area
          });
        }
      }
    }
  };
}

export function setAreaDatasetStatus(areaId, dataset, status) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      area.datasets = area.datasets.map((item) => {
        if (item.slug !== dataset) {
          return item;
        }
        return {
          ...item,
          value: status
        };
      });
      console.info(`status of ${dataset} is off`, area);
      dispatch({
        type: UPDATE_AREA,
        payload: area
      });
    }
  };
}

export function removeCachedArea(areaId, dataset) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      area.datasets = updateDatasetCache(area.datasets, dataset, false);
      dispatch({
        type: UPDATE_AREA,
        payload: area
      });
      try {
        const folder = `${CONSTANTS.maps.tilesFolder}/${areaId}/${dataset}`;
        await removeFolder(folder);
        console.info(`cache of ${dataset} is off`, area);
      } catch (e) {
        area.datasets = updateDatasetCache(area.datasets, dataset, true);
        dispatch({
          type: UPDATE_AREA,
          payload: area
        });
      }
    }
  };
}

export function deleteArea(id) {
  const url = `${Config.API_URL}/area/${id}`;
  return (dispatch, state) => {
    if (state().app.isConnected) {
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
    }
  };
}

export function updateDate(date) {
  return {
    type: UPDATE_DATE,
    payload: date
  };
}


const alerts = [
  { slug: 'terrailoss', name: 'GLAD', value: true, options: [{ name: 'cache', value: false }, { name: 'timeframe', value: ['01/01/2016', '01/01/2017'] }] },
  { slug: 'viirs', name: 'VIIRS', value: false, options: [{ name: 'cache', value: false }, { name: 'timeframe', value: ['01/01/2016', '01/01/2017'] }] },
  { slug: 'forma', name: 'FORMA', value: false, options: [{ name: 'cache', value: false }, { name: 'timeframe', value: ['01/01/2016', '01/01/2017'] }] }
];

export function getDatasets(areaId) {
  return (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const url = `${Config.API_URL}/coverage/intersect?geostore=${area.attributes.geostore}`;
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${state().user.token}`
      }
    })
      .then(response => {
        if (response.ok) return response.json();
        throw Error(response.statusText);
      })
      .then((response) => {
        const datasets = [];
        if (response.data && response.data.attributes) {
          const { layers } = response.data.attributes;
          for (let i = 0, aLength = alerts.length; i < aLength; i++) {
            for (let j = 0, lLength = layers.length; j < lLength; j++) {
              if (alerts[i].slug === layers[j]) {
                datasets.push(alerts[i]);
              }
            }
          }
        }
        area.datasets = datasets;
        dispatch({
          type: UPDATE_AREA,
          payload: area
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
  };
}
