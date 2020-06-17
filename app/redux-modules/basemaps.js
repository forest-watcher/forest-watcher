// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';
import type { Dispatch, GetState, State, Thunk } from 'types/store.types';

import { DELETE_AREA_COMMIT } from 'redux-modules/areas';
import { LOGOUT_REQUEST } from 'redux-modules/user';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import { trackImportedContent } from 'helpers/analytics';
import { deleteMapboxOfflinePack } from 'helpers/mapbox';
import { importLayerFile } from 'helpers/layer-store/import/importLayerFile';
import { DELETE_ROUTE } from './routes';

// Actions
export const IMPORT_BASEMAP_REQUEST = 'basemaps/IMPORT_BASEMAP_REQUEST';
export const IMPORT_BASEMAP_PROGRESS = 'basemaps/IMPORT_BASEMAP_PROGRESS';
export const IMPORT_BASEMAP_AREA_COMPLETED = 'basemaps/IMPORT_BASEMAP_AREA_COMPLETED';
export const IMPORT_BASEMAP_COMMIT = 'basemaps/IMPORT_BASEMAP_COMMIT';
const IMPORT_BASEMAP_CLEAR = 'basemaps/IMPORT_BASEMAP_CLEAR';
const IMPORT_BASEMAP_ROLLBACK = 'basemaps/IMPORT_BASEMAP_ROLLBACK';
const RENAME_BASEMAP = 'basemaps/RENAME_BASEMAP';
const DELETE_BASEMAP = 'basemaps/DELETE_BASEMAP';

// Reducer
const initialState: BasemapsState = {
  downloadedBasemapProgress: {},
  importedBasemaps: [],
  importError: null,
  importing: false
};

export default function reducer(state: BasemapsState = initialState, action: BasemapsAction): BasemapsState {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      const { basemaps }: State = action.payload;

      return {
        ...state,
        ...basemaps,
        importError: null,
        importing: false
      };
    }
    case IMPORT_BASEMAP_REQUEST: {
      const updatedState = { ...state, importing: !(action.payload?.remote ?? false), importError: null };

      if (action.payload?.remote) {
        // This is a remote layer, we need to add this area into the layer's progress state so it can be tracked.
        const dataId = action.payload?.dataId;
        const layerId = action.payload?.layerId;

        if (!dataId || !layerId) {
          return updatedState;
        }

        // Within the downloadedBasemapProgress state, within the basemap-specific object, we mark the
        // given area as being downloaded.
        // We can then refer to this for download progress or to hold errors.
        const updatedStateWithProgress = {
          ...updatedState,
          downloadedBasemapProgress: {
            ...updatedState.downloadedBasemapProgress,
            [layerId]: {
              ...updatedState.downloadedBasemapProgress[layerId],
              [dataId]: {
                requested: true,
                progress: 0,
                completed: false,
                error: false
              }
            }
          }
        };

        return updatedStateWithProgress;
      }
      return updatedState;
    }
    case IMPORT_BASEMAP_PROGRESS: {
      const { id, progress, layerId } = action.payload;

      const updatedStateWithProgress = {
        ...state,
        downloadedBasemapProgress: {
          ...state.downloadedBasemapProgress,
          [layerId]: {
            ...state.downloadedBasemapProgress[layerId],
            [id]: {
              ...state.downloadedBasemapProgress[layerId]?.[id],
              progress
            }
          }
        }
      };

      return updatedStateWithProgress;
    }
    case IMPORT_BASEMAP_AREA_COMPLETED: {
      const { id, layerId, failed } = action.payload;

      // Mark the download as completed, with an error if one occurred.
      // We can then check for every request being completed, and if so the layer download can be concluded.
      return {
        ...state,
        downloadedBasemapProgress: {
          ...state.downloadedBasemapProgress,
          [layerId]: {
            ...state.downloadedBasemapProgress[layerId],
            [id]: {
              requested: false,
              progress: 100,
              completed: true,
              error: failed
            }
          }
        }
      };
    }
    case IMPORT_BASEMAP_COMMIT: {
      const basemapToSave = action.payload;
      let importedBasemaps = [...state.importedBasemaps];

      if (importedBasemaps.find(basemap => basemap.id === basemapToSave.id)) {
        // This layer already exists in redux, replace the existing entry with the new one.
        importedBasemaps = importedBasemaps.map(basemap => (basemap.id === basemapToSave.id ? basemapToSave : basemap));
        return { ...state, importingLayer: false, importError: null, importedBasemaps: importedBasemaps };
      }

      return {
        ...state,
        importing: false,
        importError: null,
        importedBasemaps: [...importedBasemaps, basemapToSave]
      };
    }
    case IMPORT_BASEMAP_CLEAR: {
      return { ...state, importing: false, importError: null };
    }
    case IMPORT_BASEMAP_ROLLBACK: {
      return { ...state, importing: false, importError: action.payload };
    }
    case RENAME_BASEMAP: {
      let basemaps = [...state.importedBasemaps];
      const targetBasemap = basemaps.filter(basemap => basemap.id === action.payload.id)?.[0];

      if (!targetBasemap) {
        return state;
      }

      targetBasemap.name = action.payload.name;

      basemaps = basemaps.map(basemap => (basemap.id === action.payload.id ? targetBasemap : basemap));

      return { ...state, importedBasemaps: basemaps };
    }
    case DELETE_BASEMAP: {
      const basemaps = state.importedBasemaps.filter(basemap => basemap.id !== action.payload);

      const downloadProgress = { ...state.downloadedBasemapProgress };
      delete downloadProgress[action.payload];

      return { ...state, downloadedBasemapProgress: downloadProgress, importedBasemaps: basemaps };
    }
    case DELETE_AREA_COMMIT: {
      const downloadedBasemapProgress = { ...state.downloadedBasemapProgress };

      const areaId = action.meta.area.id;
      Object.keys(downloadedBasemapProgress).forEach(layerId => {
        const layerProgress = downloadedBasemapProgress[layerId];

        delete layerProgress[areaId];

        downloadedBasemapProgress[areaId] = layerProgress;
      });

      return { ...state, downloadedBasemapProgress };
    }
    case DELETE_ROUTE: {
      const routeId = action.payload.id ?? action.payload.areaId;

      if (!routeId) {
        return state;
      }

      // Delete the download progress for the given route, for every downloaded layer.
      const downloadedBasemapProgress = { ...state.downloadedBasemapProgress };

      Object.keys(downloadedBasemapProgress).forEach(layerId => {
        const layerProgress = downloadedBasemapProgress[layerId];

        delete layerProgress[routeId];

        downloadedBasemapProgress[layerId] = layerProgress;
      });

      return { ...state, downloadedBasemapProgress };
    }
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
}

/**
 * importBasemap - given a file object imported via the native file manager,
 * store it within the app and retain metadata in redux.
 *
 * @param {File} basemapFile a file selected by the user.
 */
export function importBasemap(basemapFile: File): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, state: GetState) => {
    dispatch({ type: IMPORT_BASEMAP_REQUEST });

    try {
      const importedFile: LayerFile = await importLayerFile(basemapFile);
      const basemap: Basemap = {
        isCustom: true,
        id: importedFile.layerId,
        name: basemapFile.name,
        path: importedFile.path,
        size: importedFile.size
      };

      trackImportedContent('basemap', basemapFile.fileName, true, importedFile.size);

      dispatch({
        type: IMPORT_BASEMAP_COMMIT,
        payload: basemap
      });
    } catch (error) {
      dispatch({ type: IMPORT_BASEMAP_ROLLBACK, payload: error });
      trackImportedContent('basemap', basemapFile.fileName, true, basemapFile.size);
      throw error;
    }
  };
}

export function renameBasemap(id: string, name: string): BasemapsAction {
  return {
    type: RENAME_BASEMAP,
    payload: {
      id,
      name
    }
  };
}

export function deleteBasemap(id: string): BasemapsAction {
  return {
    type: DELETE_BASEMAP,
    payload: id
  };
}

export function deleteMapboxOfflinePacks(basemapId: string): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, getState: GetState) => {
    const state = getState();

    const regionIds = [...state.areas.data, ...state.routes.previousRoutes].map(region => region.id);

    const promises = regionIds.map(async (id: string) => {
      await deleteMapboxOfflinePack(id, basemapId);
    });

    await Promise.all(promises);
  };
}

/**
 * clearImportBasemapState - removed any retained state info to allow for a fresh import.
 */
export function clearImportBasemapState(): BasemapsAction {
  return {
    type: IMPORT_BASEMAP_CLEAR
  };
}
