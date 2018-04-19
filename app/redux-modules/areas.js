// @flow
import type { Area, AreasAction, AreasState } from 'types/areas.types';
import type { CountryArea } from 'types/setup.types';
import type { Dispatch, GetState } from 'types/store.types';

import Config from 'react-native-config';
import omit from 'lodash/omit';
import { getCachedImageByUrl } from 'helpers/fileManagement';
import { getActionsTodoCount } from 'helpers/sync';

// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { RETRY_SYNC } from 'redux-modules/app';
import { GET_ALERTS_COMMIT } from 'redux-modules/alerts';

const GET_AREAS_REQUEST = 'areas/GET_AREAS_REQUEST';
export const GET_AREAS_COMMIT = 'areas/GET_AREAS_COMMIT';
const GET_AREAS_ROLLBACK = 'areas/GET_AREAS_ROLLBACK';
const SET_AREAS_REFRESHING = 'areas/SET_AREAS_REFRESHING';
export const SAVE_AREA_REQUEST = 'areas/SAVE_AREA_REQUEST';
export const SAVE_AREA_COMMIT = 'areas/SAVE_AREA_COMMIT';
export const SAVE_AREA_ROLLBACK = 'areas/SAVE_AREA_ROLLBACK';
export const UPDATE_AREA_REQUEST = 'areas/UPDATE_AREA_REQUEST';
const UPDATE_AREA_COMMIT = 'areas/UPDATE_AREA_COMMIT';
const UPDATE_AREA_ROLLBACK = 'areas/UPDATE_AREA_ROLLBACK';
const DELETE_AREA_REQUEST = 'areas/DELETE_AREA_REQUEST';
export const DELETE_AREA_COMMIT = 'areas/DELETE_AREA_COMMIT';
const DELETE_AREA_ROLLBACK = 'areas/DELETE_AREA_ROLLBACK';
const SET_AREA_IMAGE_REQUEST = 'areas/SET_AREA_IMAGE_REQUEST';
const SET_AREA_IMAGE_COMMIT = 'areas/SET_AREA_IMAGE_COMMIT';
const UPDATE_INDEX = 'areas/UPDATE_INDEX';

// Helpers
function getAreaById(areas: Array<Area>, areaId: string) {
  // Using deconstructor to generate a new object
  return { ...areas.find((areaData) => (areaData.id === areaId)) };
}

// Reducer
const initialState = {
  data: [],
  selectedIndex: 0,
  images: {},
  synced: false,
  refreshing: false,
  syncing: false,
  syncError: false,
  syncDate: Date.now(),
  pendingData: {
    image: {}
  }
};

export default function reducer(state: AreasState = initialState, action: AreasAction) {
  switch (action.type) {
    case RETRY_SYNC: {
      return { ...state, syncError: false };
    }
    case SET_AREAS_REFRESHING: {
      return { ...state, refreshing: action.payload };
    }
    case GET_AREAS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_AREAS_COMMIT: {
      let pendingData = { ...state.pendingData };
      const data = [...action.payload];
      data.forEach((newArea) => {
        pendingData = {
          image: { ...pendingData.image, [newArea.id]: false }
        };
      });
      const syncData = {
        syncDate: Date.now(),
        synced: true,
        syncing: false,
        syncError: false,
        refreshing: false
      };
      return { ...state, data, pendingData, ...syncData };
    }
    case GET_AREAS_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case GET_ALERTS_COMMIT: {
      const area = action.meta.area;
      const data = state.data.map((a) => {
        if (a.id === area.id) {
          const datasets = a.datasets.map((dataset) => {
            if (dataset.slug === action.meta.datasetSlug) {
              return { ...dataset, lastUpdate: Date.now() };
            }
            return dataset;
          });
          return { ...a, datasets };
        }
        return a;
      });
      return { ...state, data };
    }
    case SET_AREA_IMAGE_REQUEST: {
      const area = action.payload;
      const pendingData = { ...state.pendingData, image: { ...state.pendingData.image, [area.id]: true } };
      return { ...state, pendingData };
    }
    case SET_AREA_IMAGE_COMMIT: {
      const area = action.meta.area;
      const images = { ...state.images, [area.id]: action.payload };
      const pendingData = {
        ...state.pendingData,
        image: omit(state.pendingData.image, [area.id])
      };
      return { ...state, images, pendingData };
    }
    case SAVE_AREA_REQUEST: {
      return { ...state, synced: false, syncing: true };
    }
    case SAVE_AREA_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case SAVE_AREA_COMMIT: {
      let data = state.data;
      const area = action.payload;
      let pendingData = state.pendingData;
      if (area) {
        data = [...data, area];
        const { image } = state.pendingData;
        pendingData = {
          image: { ...image, [area.id]: false }
        };
      }
      return { ...state, data, pendingData, synced: true, syncing: false };
    }
    case UPDATE_AREA_REQUEST: {
      const newArea = { ...action.payload };
      const areas = state.data.map((area) => {
        if (area.id === newArea.id) {
          return { ...newArea };
        }
        return area;
      });
      return { ...state, data: areas };
    }
    case UPDATE_AREA_COMMIT: {
      // Not overwritting the geostore
      const { geostore, ...newArea } = action.payload; // eslint-disable-line
      const data = state.data.map((area) => {
        if (area.id === newArea.id) {
          return { ...area, ...newArea };
        }
        return area;
      });
      return { ...state, data };
    }
    case UPDATE_AREA_ROLLBACK: {
      const oldArea = action.meta;
      const areas = state.data.map((area) => {
        if (area.id === oldArea.id) {
          return { ...oldArea };
        }
        return area;
      });
      return { ...state, data: areas };
    }
    case DELETE_AREA_REQUEST: {
      const data = state.data.filter((area) => (
        area.id !== action.payload.id
      ));
      return { ...state, data, synced: false, syncing: true };
    }
    case DELETE_AREA_COMMIT: {
      const { id } = action.meta.area || {};
      let images = state.images;
      if (typeof images[id] !== 'undefined') {
        images = omit(images, [id]);
      }
      // Update the selectedIndex of the map
      let selectedIndex = state.selectedIndex || 0;
      if (selectedIndex > 0) {
        let deletedIndex = 0;
        for (let i = 0; i < state.data.length; i++) {
          if (state.data[i].id === id) {
            deletedIndex = i;
            break;
          }
        }
        if (deletedIndex <= selectedIndex) {
          selectedIndex -= 1;
        }
      }
      return { ...state, images, synced: true, syncing: false, selectedIndex };
    }
    case DELETE_AREA_ROLLBACK: {
      const data = [...state.data, action.meta.area];
      return { ...state, data, syncing: false };
    }
    case UPDATE_INDEX: {
      return Object.assign({}, state, { selectedIndex: action.payload });
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      return state;
  }
}

export function getAreas(): AreasAction {
  const url = `${Config.API_URL}/forest-watcher/area`;
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

export function cacheAreaImage(areaId: string) {
  return (dispatch: Dispatch, state: GetState) => {
    const areas = state().areas;
    const area = getAreaById(areas.data, areaId);
    dispatch({
      type: SET_AREA_IMAGE_REQUEST,
      payload: area,
      meta: {
        offline: {
          effect: { promise: getCachedImageByUrl(area.image, 'areas') },
          commit: { type: SET_AREA_IMAGE_COMMIT, meta: { area } }
        }
      }
    });
  };
}

export function updateArea(area: Area) {
  return async (dispatch: Dispatch, state: GetState) => {
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

export function updateSelectedIndex(index: number): AreasAction {
  return {
    type: UPDATE_INDEX,
    payload: index
  };
}

export function setAreasRefreshing(refreshing: boolean): AreasAction {
  return {
    type: SET_AREAS_REFRESHING,
    payload: refreshing
  };
}

export function saveArea(params: { snapshot: string, area: CountryArea }): AreasAction {
  const url = `${Config.API_URL}/forest-watcher/area`;
  const headers = { 'content-type': 'multipart/form-data' };
  const body = new FormData();
  body.append('name', params.area.name);
  body.append('geojson', JSON.stringify(params.area.geojson));

  const image = {
    uri: params.snapshot,
    type: 'image/jpg',
    name: `${encodeURIComponent(params.area.name)}.jpg`
  };

  if (params.datasets) {
    body.append('datasets', JSON.stringify(params.datasets));
  }
  // $FlowFixMe
  body.append('image', image);
  return {
    type: SAVE_AREA_REQUEST,
    meta: {
      offline: {
        effect: { url, method: 'POST', headers, body },
        commit: { type: SAVE_AREA_COMMIT },
        rollback: { type: SAVE_AREA_ROLLBACK }
      }
    }
  };
}

export function setAreaDatasetStatus(areaId: string, datasetSlug: string, status: boolean) {
  return async (dispatch: Dispatch, state: GetState) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const datasets = area.datasets.map((item) => {
        if (item.slug !== datasetSlug) {
          return status === true
            ? { ...item, active: false }
            : item;
        }
        return { ...item, active: status };
      });
      dispatch(updateArea({ ...area, datasets }));
    }
  };
}

export function updateDate(areaId: string, datasetSlug: string, date: Object) {
  return async (dispatch: Dispatch, state: GetState) => {
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


export function deleteArea(areaId: string) {
  return async (dispatch: Dispatch, state: GetState) => {
    const area = getAreaById(state().areas.data, areaId);
    if (area) {
      const url = `${Config.API_URL}/area/${area.id}`;
      dispatch({
        type: DELETE_AREA_REQUEST,
        payload: area,
        meta: {
          offline: {
            effect: { url, method: 'DELETE' },
            commit: { type: DELETE_AREA_COMMIT, meta: { area } },
            rollback: { type: DELETE_AREA_ROLLBACK, meta: { area } }
          }
        }
      });
    }
  };
}

export function syncAreas() {
  return async (dispatch: Dispatch, state: GetState) => {
    const { loggedIn } = state().user;
    const { data, synced, syncing, pendingData } = state().areas;
    const hasAreas = data && data.length;
    if (hasAreas && synced && getActionsTodoCount(pendingData) > 0) {
      Object.keys(pendingData).forEach((type) => {
        const syncingAreasData = pendingData[type];
        const canDispatch = id => (typeof syncingAreasData[id] !== 'undefined' && syncingAreasData[id] === false);
        const syncAreasData = (action) => {
          Object.keys(syncingAreasData).forEach(id => {
            if (canDispatch(id)) {
              action(id);
            }
          });
        };
        switch (type) {
          case 'image':
            syncAreasData(id => dispatch(cacheAreaImage(id)));
            break;
          default:
        }
      });
    } else if (!synced && !syncing && loggedIn) {
      dispatch(getAreas());
    }
  };
}
