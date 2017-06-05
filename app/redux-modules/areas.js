import Config from 'react-native-config';
import { getGeostore } from 'redux-modules/geostore';
import { getCachedImageByUrl, removeFolder } from 'helpers/fileManagement';
import { getBboxTiles, cacheTiles } from 'helpers/map';
import { getInitialDatasets } from 'helpers/area';
import BoundingBox from 'boundingbox';
import CONSTANTS from 'config/constants';

// Actions
import { SET_AREA_SAVED } from 'redux-modules/setup';
import { LOGOUT_COMMIT } from 'redux-modules/user';

const GET_AREAS_REQUEST = 'areas/GET_AREAS_REQUEST';
const GET_AREAS_COMMIT = 'areas/GET_AREAS_COMMIT';
const GET_AREAS_ROLLBACK = 'areas/GET_AREAS_ROLLBACK';
const GET_AREA_COVERAGE_REQUEST = 'areas/GET_AREA_COVERAGE_REQUEST';
const GET_AREA_COVERAGE_COMMIT = 'areas/GET_AREA_COVERAGE_COMMIT';
const GET_AREA_COVERAGE_ROLLBACK = 'areas/GET_AREA_COVERAGE_ROLLBACK';
const UPDATE_AREA_REQUEST = 'areas/UPDATE_AREA_REQUEST';
const UPDATE_AREA_COMMIT = 'areas/UPDATE_AREA_COMMIT';
const UPDATE_AREA_ROLLBACK = 'areas/UPDATE_AREA_ROLLBACK';
const SET_AREA_IMAGE = 'areas/SET_AREA_IMAGE';
const UPDATE_AREA = 'areas/UPDATE_AREA';
const SAVE_AREA = 'areas/SAVE_AREA';
const DELETE_AREA = 'areas/DELETE_AREA';
const UPDATE_DATE = 'areas/UPDATE_DATE';
const UPDATE_INDEX = 'areas/UPDATE_INDEX';

// Reducer
const initialState = {
  data: [],
  selectedIndex: 0,
  images: {},
  synced: false,
  syncing: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case GET_AREAS_COMMIT: {
      return { ...state, data: action.payload, synced: true };
    }
    case GET_AREAS_ROLLBACK: {
      return { ...state, synced: false };
    }
    case GET_AREA_COVERAGE_COMMIT: {
      const areas = [...state.data];
      for (let i = 0, aLength = areas.length; i < aLength; i++) {
        if (areas[i].id === action.meta.id) {
          if (!areas[i].datasets) {
            areas[i].datasets = getInitialDatasets(action.payload);
          } else {
            // TODO: update the existing ones
          }
        }
      }
      return { ...state };
      // return Object.assign({}, state, { data: areas });
    }
    case SET_AREA_IMAGE: {
      const images = action.payload.images;
      return Object.assign({}, state, { images });
    }
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
    case UPDATE_AREA_REQUEST: {
      const newArea = action.payload;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return {
            ...newArea,
            synced: false
          };
        }
        return area;
      });
      return { ...state, data: areas, outdated: true };
    }
    case UPDATE_AREA_COMMIT: {
      const newArea = action.payload;
      let outdated = false;
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return {
            ...newArea,
            synced: true,
            lastUpdate: Date.now()
          };
        } else if (!area.synced) {
          outdated = true;
        }
        return area;
      });
      return { ...state, data: areas, outdated };
    }
    case UPDATE_AREA_ROLLBACK: {
      const oldArea = action.meta;
      let outdated = false;
      const areas = state.data.map((area) => {
        if (area.id === oldArea.id) {
          return {
            ...oldArea,
            synced: true,
            lastModify: Date.now()
          };
        } else if (!area.synced) {
          outdated = true;
        }
        return area;
      });
      return { ...state, data: areas, outdated };
    }
    case UPDATE_INDEX: {
      return Object.assign({}, state, { selectedIndex: action.payload });
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
    case LOGOUT_COMMIT: {
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

function updatedCacheDatasets(datasets, datasetSlug, status) {
  if (!datasets) return [];
  return datasets.map((d) => {
    const newDataset = d;
    if (d.slug === datasetSlug) {
      newDataset.cache = status;
    }
    return newDataset;
  });
}

export function getAreas() {
  const url = `${Config.API_URL}/area`;
  return {
    type: GET_AREAS_REQUEST,
    meta: {
      offline: {
        effect: { url },
        commit: { type: GET_AREAS_COMMIT },
        rollback: { type: GET_AREAS_ROLLBACK }
      }
    }
  };
}

export function getAreaGeostore(areaId) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const geostores = state().geostore.data;
    if (!geostores[area.geostore]) {
      dispatch(getGeostore(area.geostore));
    }
  };
}

export function cacheAreaImage(areaId) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const images = Object.assign({}, state().areas.images);
    if (!images[area.id]) {
      images[area.id] = await getCachedImageByUrl(area.image, 'areas');
      dispatch({
        type: SET_AREA_IMAGE,
        payload: images
      });
    }
  };
}

export function getAreaCoverage(areaId) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const url = `${Config.API_URL}/coverage/intersect?geostore=${area.geostore}`;
    dispatch({
      type: GET_AREA_COVERAGE_REQUEST,
      meta: {
        offline: {
          effect: { url, meta: area },
          commit: { type: GET_AREA_COVERAGE_COMMIT, meta: area },
          rollback: { type: GET_AREA_COVERAGE_ROLLBACK }
        }
      }
    });
  };
}

//   WIP: REMOVE WHEN THE 3 ACTIONS ABOVE ARE FINISHED

//   return (dispatch, state) => {
//     if (state().offline.online) {
//       fetch(url, {
//         headers: {
//           Authorization: `Bearer ${state().user.token}`
//         }
//       })
//         .then(response => {
//           if (response.ok) return response.json();
//           throw new Error(response.statusText);
//         })
//         .then(async (response) => {
//           // TODO: check datasets and if not create them;
//           const images = Object.assign({}, state().areas.images);
//           const normalizedAreas = normalize(response);
//           await Promise.all(response.data.map(async (area) => {
//             if (area.na && area.attributes.geostore) {
//               if (!state().geostore.data[area.attributes.geostore]) {
//                 await dispatch(getGeostore(area.attributes.geostore));
//               }
//               if (!images[area.id]) {
//                 images[area.id] = await getCachedImageByUrl(area.attributes.image, 'areas');
//               }
//             }
//             return area;
//           }));

//           dispatch({
//             type: GET_AREAS,
//             payload: {
//               images,
//               data: response.data
//             }
//           });

//           // TODO: split the request of the gesotres, images and datasets
//           response.data.map((area) => dispatch(getDatasets(area.id)));
//         })
//         .catch((error) => {
//           console.warn(error);
//           // To-do
//         });
//     }
//   };
// }

export function updateArea(area) {
  return async (dispatch, state) => {
    const url = `${Config.API_URL}/area/${area.id}`;
    const originalArea = getAreaById(state().areas.data, area.id);
    const headers = { 'content-type': 'multipart/form-data' };
    const body = new FormData();
    if (area.name) {
      body.append('name', area.name);
    }
    if (area.datasets) {
      body.append('datasets', JSON.stringify(area.datasets));
    }
    dispatch({
      type: UPDATE_AREA_REQUEST,
      payload: area,
      meta: {
        offline: {
          effect: { url, method: 'PATCH', headers, body },
          commit: { type: UPDATE_AREA_COMMIT },
          rollback: { type: UPDATE_AREA_ROLLBACK, meta: originalArea }
        }
      }
    });
  };
}

export function updateSelectedIndex(index) {
  return {
    type: UPDATE_INDEX,
    payload: index
  };
}

async function downloadArea(bbox, areaId, datasetSlug) {
  const zooms = CONSTANTS.maps.cachedZoomLevels;
  const tilesArray = getBboxTiles(bbox, zooms);
  await cacheTiles(tilesArray, areaId, datasetSlug);
}

export function saveArea(params) {
  const url = `${Config.API_URL}/area`;
  return (dispatch, state) => {
    if (state().offline.online) {
      const form = new FormData();
      form.append('name', params.area.name);
      form.append('geostore', params.area.geostore);
      const image = {
        uri: params.snapshot,
        type: 'image/png',
        name: `${params.area.name}.png`
      };
      if (params.datasets) {
        form.append('datasets', JSON.stringify(params.datasets));
      }
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
          console.warn('Error saving data', error);
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

export function cacheArea(areaId, datasetSlug) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);

    if (area && state().offline.online) {
      const geojson = state().geostore.data[area.geostore];
      if (geojson) {
        area.datasets = updatedCacheDatasets(area.datasets, datasetSlug, true);
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
            await downloadArea(bbox, areaId, datasetSlug);
          }
        } catch (e) {
          area.datasets = updatedCacheDatasets(area.datasets, datasetSlug, false);
          dispatch({
            type: UPDATE_AREA,
            payload: area
          });
        }
      }
    }
  };
}

export function setAreaDatasetStatus(areaId, datasetSlug, status) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      area.datasets = area.datasets.map((item) => {
        if (item.slug !== datasetSlug) {
          return status === true
            ? { ...item, active: false }
            : item;
        }
        return { ...item, active: status };
      });
      dispatch(updateArea(area));
    }
  };
}

export function updateDate(areaId, datasetSlug, date) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    const dateKeys = Object.keys(date) || [];
    if (area) {
      area.datasets = area.datasets.map((d) => {
        const newDataset = d;
        if (d.slug === datasetSlug) {
          dateKeys.forEach((dKey) => {
            if (d[dKey]) {
              newDataset[dKey] = date[dKey];
            }
          });
        }
        return newDataset;
      });
      dispatch(updateArea(area));
    }
  };
}

export function removeCachedArea(areaId, datasetSlug) {
  return async (dispatch, state) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      area.datasets = updatedCacheDatasets(area.datasets, datasetSlug, false);
      dispatch({
        type: UPDATE_AREA,
        payload: area
      });
      try {
        const folder = `${CONSTANTS.maps.tilesFolder}/${areaId}/${datasetSlug}`;
        await removeFolder(folder);
      } catch (e) {
        area.datasets = updatedCacheDatasets(area.datasets, datasetSlug, true);
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
    if (state().offline.online) {
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
    }
  };
}
