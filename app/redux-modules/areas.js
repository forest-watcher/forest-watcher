// @flow
import type { Area, AreasAction, AreasState, Dataset } from 'types/areas.types';
import type { CountryArea } from 'types/setup.types';
import type { Dispatch, GetState } from 'types/store.types';

import Config from 'react-native-config';
// Actions
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { RETRY_SYNC } from 'redux-modules/shared';
import { GET_ALERTS_COMMIT } from 'redux-modules/alerts';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import deleteAlerts from 'helpers/alert-store/deleteAlerts';

const GET_AREAS_REQUEST = 'areas/GET_AREAS_REQUEST';
export const GET_AREAS_COMMIT = 'areas/GET_AREAS_COMMIT';
const GET_AREAS_ROLLBACK = 'areas/GET_AREAS_ROLLBACK';
const SET_AREAS_REFRESHING = 'areas/SET_AREAS_REFRESHING';
export const SAVE_AREA_REQUEST = 'areas/SAVE_AREA_REQUEST';
export const SAVE_AREA_COMMIT = 'areas/SAVE_AREA_COMMIT';
export const SAVE_AREA_ROLLBACK = 'areas/SAVE_AREA_ROLLBACK';
const UPDATE_AREA_REQUEST = 'areas/UPDATE_AREA_REQUEST';
const UPDATE_AREA_COMMIT = 'areas/UPDATE_AREA_COMMIT';
const UPDATE_AREA_ROLLBACK = 'areas/UPDATE_AREA_ROLLBACK';
const DELETE_AREA_REQUEST = 'areas/DELETE_AREA_REQUEST';
export const DELETE_AREA_COMMIT = 'areas/DELETE_AREA_COMMIT';
const DELETE_AREA_ROLLBACK = 'areas/DELETE_AREA_ROLLBACK';

// Helpers
function getAreaById(areas: Array<Area>, areaId: ?string): ?Area {
  const area = areas.find(areaData => areaData.id === areaId);
  return area ? { ...area } : null;
}

// Reducer
const initialState = {
  data: [],
  synced: false,
  refreshing: false,
  syncing: false,
  syncError: false,
  syncDate: Date.now()
};

export default function reducer(state: AreasState = initialState, action: AreasAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { areas } = action.payload;
      return { ...state, ...areas, syncError: false };
    }
    case RETRY_SYNC: {
      return { ...state, syncError: false };
    }
    case SET_AREAS_REFRESHING: {
      return { ...state, refreshing: action.payload };
    }
    case GET_AREAS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_AREAS_COMMIT: {
      const syncData = {
        syncDate: Date.now(),
        synced: true,
        syncing: false,
        syncError: false,
        refreshing: false
      };
      const importedAreas = state.data.filter(area => area.isImported);
      return { ...state, data: [...action.payload, ...importedAreas], ...syncData };
    }
    case GET_AREAS_ROLLBACK: {
      return { ...state, syncing: false, syncError: true };
    }
    case GET_ALERTS_COMMIT: {
      const area = action.meta.area;
      const data: Array<Area> = state.data.map((a: Area) => {
        if (a.id === area.id) {
          const datasets = a.datasets.map(dataset => {
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
    case SAVE_AREA_REQUEST: {
      return { ...state, synced: false, syncing: true, refreshing: true };
    }
    case SAVE_AREA_COMMIT: {
      let data = state.data;
      const areaToSave = action.payload;
      if (areaToSave) {
        // Ignore the saved area if it already exists - this could happen when importing an area for example
        const possiblyPreexistingArea = state.data.find(area => area.id === areaToSave.id);
        if (!possiblyPreexistingArea) {
          data = [...data, areaToSave];
        } else {
          console.warn('3SC', `Ignore already existing area with ID ${areaToSave.id}`);
        }
      }
      return { ...state, data, synced: true, syncing: false, refreshing: false };
    }
    case SAVE_AREA_ROLLBACK: {
      return { ...state, syncing: false, refreshing: false };
    }
    case UPDATE_AREA_REQUEST: {
      const newArea = { ...action.payload };
      const areas: Array<Area> = state.data.map(area => {
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
      const data: Array<Area> = state.data.map(area => {
        if (area.id === newArea.id) {
          return { ...area, ...newArea };
        }
        return area;
      });
      return { ...state, data };
    }
    case UPDATE_AREA_ROLLBACK: {
      const oldArea = action.meta;
      const areas: Array<Area> = state.data.map(area => {
        if (area.id === oldArea.id) {
          return { ...oldArea };
        }
        return area;
      });
      return { ...state, data: areas };
    }
    case DELETE_AREA_REQUEST: {
      const data: Array<Area> = state.data.filter((area: Area) => area.id !== action.payload.id);
      return { ...state, data, synced: false, syncing: true };
    }
    case DELETE_AREA_COMMIT: {
      const { id } = action.meta.area || {};
      if (id) {
        deleteAlerts({
          areaId: id
        });
      }
      return { ...state, synced: true, syncing: false };
    }
    case DELETE_AREA_ROLLBACK: {
      const data = [...state.data, action.meta.area];
      return { ...state, data, syncing: false };
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      // eslint-disable-next-line babel/no-unused-expressions
      (action.type: empty);
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

export function updateArea(area: Area) {
  return (dispatch: Dispatch, state: GetState) => {
    // For imported areas, we don't need to do a network request
    // Use the same Redux actions to only apply the change locally
    if (area.isImported) {
      dispatch({
        type: UPDATE_AREA_REQUEST,
        payload: area
      });
      dispatch({
        type: UPDATE_AREA_COMMIT,
        payload: area
      });
      return;
    }

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

export function setAreasRefreshing(refreshing: boolean): AreasAction {
  return {
    type: SET_AREAS_REFRESHING,
    payload: refreshing
  };
}

export function saveArea(params: { datasets: Array<Dataset>, snapshot: string, area: CountryArea }): AreasAction {
  const url = `${Config.API_URL}/forest-watcher/area`;
  const headers = { 'content-type': 'multipart/form-data' };
  const body = new FormData();
  body.append('name', params.area.name);
  // $FlowFixMe
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
        rollback: { type: SAVE_AREA_ROLLBACK, meta: params }
      }
    }
  };
}

export function deleteArea(areaId: ?string) {
  return (dispatch: Dispatch, state: GetState) => {
    const area = getAreaById(state().areas.data, areaId);

    if (area) {
      // For imported areas, we don't need to do a network request
      // Use the same Redux actions to only apply the change locally
      if (area.isImported) {
        dispatch({
          type: DELETE_AREA_REQUEST,
          payload: area
        });
        dispatch({
          type: DELETE_AREA_COMMIT,
          meta: { area }
        });
        return;
      }

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
  return (dispatch: Dispatch, state: GetState) => {
    const { loggedIn } = state().user;
    const { synced, syncing } = state().areas;
    if (!synced && !syncing && loggedIn) {
      dispatch(getAreas());
    }
  };
}
