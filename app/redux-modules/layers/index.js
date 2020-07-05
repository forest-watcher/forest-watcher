// @flow
import type { Layer, LayersState, LayersAction } from 'types/layers.types';
import type { Dispatch, GetState, State, Thunk } from 'types/store.types';

import type { File } from 'types/file.types';

import type { LayerFile } from 'types/sharing.types';

import Config from 'react-native-config';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { DELETE_AREA_COMMIT } from 'redux-modules/areas';
import { DELETE_ROUTE } from 'redux-modules/routes';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import { invalidateIncompleteLayerDownloads, deleteRegionFromProgress } from 'redux-modules/layers/downloadLayer';

import { trackImportedContent } from 'helpers/analytics';

import deleteLayerFiles from 'helpers/layer-store/deleteLayerFiles';

import { importLayerFile } from 'helpers/layer-store/import/importLayerFile';

const GET_LAYERS_REQUEST = 'layers/GET_LAYERS_REQUEST';
const GET_LAYERS_COMMIT = 'layers/GET_LAYERS_COMMIT';
const GET_LAYERS_ROLLBACK = 'layers/GET_LAYERS_ROLLBACK';

import {
  IMPORT_LAYER_REQUEST,
  IMPORT_LAYER_PROGRESS,
  IMPORT_LAYER_AREA_COMPLETED,
  IMPORT_LAYER_COMMIT,
  RESET_REGION_PROGRESS
} from 'redux-modules/shared';
const IMPORT_LAYER_CLEAR = 'layers/IMPORT_LAYER_CLEAR';
export const IMPORT_LAYER_ROLLBACK = 'layers/IMPORT_LAYER_ROLLBACK';

const RENAME_LAYER = 'layers/RENAME_LAYER';
const DELETE_LAYER = 'layers/DELETE_LAYER';

// Reducer
const initialState: LayersState = {
  data: [],
  synced: false,
  syncing: false,
  syncDate: Date.now(),
  importError: null,
  imported: [],
  importingLayer: false, // whether a layer is currently being imported.
  downloadedLayerProgress: {} // saves the progress relative to each layer, for every area being downloaded.
};

export default function reducer(state: LayersState = initialState, action: LayersAction): LayersState {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      // $FlowFixMe
      const { layers }: State = action.payload;

      // Reset the status for any layers that failed to complete fully.
      const updatedProgress = invalidateIncompleteLayerDownloads({ ...state.downloadedLayerProgress });

      return {
        ...state,
        ...layers,
        synced: false,
        syncing: false,
        downloadedLayerProgress: updatedProgress
      };
    }
    case GET_LAYERS_REQUEST:
      return { ...state, synced: false, syncing: true };
    case GET_LAYERS_COMMIT: {
      const typedPayload = [...action.payload].map(layer => {
        const mutableLayer = { ...layer };
        mutableLayer.type = 'contextual_layer';

        return mutableLayer;
      });

      const syncDate = Date.now();

      return { ...state, data: typedPayload, syncDate, synced: true, syncing: false };
    }
    case GET_LAYERS_ROLLBACK: {
      return { ...state, syncing: false };
    }
    case DELETE_AREA_COMMIT: {
      const { area } = action.meta;
      const areaId = area.id;

      // Delete the download progress for the given area, for every downloaded layer.
      const downloadedLayerProgress = { ...state.downloadedLayerProgress };
      const updatedProgress = deleteRegionFromProgress(areaId, downloadedLayerProgress);

      return { ...state, downloadedLayerProgress: updatedProgress };
    }
    case DELETE_ROUTE: {
      const routeId = action.payload.id ?? action.payload.areaId;

      // Delete the download progress for the given route, for every downloaded layer.
      const downloadedLayerProgress = { ...state.downloadedLayerProgress };
      const updatedProgress = deleteRegionFromProgress(routeId, downloadedLayerProgress);

      return { ...state, downloadedLayerProgress: updatedProgress };
    }
    case RESET_REGION_PROGRESS: {
      return { ...state, downloadedLayerProgress: action.payload };
    }
    case IMPORT_LAYER_CLEAR: {
      return { ...state, importingLayer: false, importError: null };
    }
    case IMPORT_LAYER_COMMIT: {
      const layerToSave = action.payload;
      let importedLayers = [...state.imported];

      if (state.data.find(layer => layer.id === layerToSave.id)) {
        // This layer exists in the default state, so do not import it.
        return state;
      }

      if (importedLayers.find(layer => layer.id === layerToSave.id)) {
        // This layer already exists in redux, replace the existing entry with the new one.
        importedLayers = importedLayers.map(layer => (layer.id === layerToSave.id ? layerToSave : layer));

        return { ...state, importingLayer: false, importError: null, imported: importedLayers };
      }

      return { ...state, importingLayer: false, importError: null, imported: [...importedLayers, layerToSave] };
    }
    case IMPORT_LAYER_REQUEST: {
      const updatedState = { ...state, importingLayer: !(action.payload?.remote ?? false), importError: null };

      if (action.payload?.remote) {
        // This is a remote layer, we need to add this area into the layer's progress state so it can be tracked.
        const dataId = action.payload?.dataId;
        const layerId = action.payload?.layerId;

        if (!dataId || !layerId) {
          return updatedState;
        }

        // Within the downloadedLayerProgress state, within the layer-specific object, we mark the
        // given area as being downloaded.
        // We can then refer to this for download progress or to hold errors.
        const updatedStateWithProgress = {
          ...updatedState,
          downloadedLayerProgress: {
            ...updatedState.downloadedLayerProgress,
            [layerId]: {
              ...updatedState.downloadedLayerProgress[layerId],
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
    case IMPORT_LAYER_PROGRESS: {
      const { id, progress, layerId } = action.payload;

      const updatedStateWithProgress = {
        ...state,
        downloadedLayerProgress: {
          ...state.downloadedLayerProgress,
          [layerId]: {
            ...state.downloadedLayerProgress[layerId],
            [id]: {
              ...state.downloadedLayerProgress[layerId]?.[id],
              progress
            }
          }
        }
      };

      return updatedStateWithProgress;
    }
    case IMPORT_LAYER_AREA_COMPLETED: {
      const { id, layerId, failed } = action.payload;

      // Mark the download as completed, with an error if one occurred.
      // We can then check for every request being completed, and if so the layer download can be concluded.
      return {
        ...state,
        downloadedLayerProgress: {
          ...state.downloadedLayerProgress,
          [layerId]: {
            ...state.downloadedLayerProgress[layerId],
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
    case IMPORT_LAYER_ROLLBACK: {
      // We do not use ROLLBACK for remote download errors - as a layer may complete for some of the requested areas.
      // Instead, we will commit the changes we have got, and then use the progress state to determine if errors occured.
      return {
        ...state,
        importingLayer: false,
        importError: action.payload
      };
    }
    case RENAME_LAYER: {
      let layers = state.imported;
      const layer = layers.filter(layer => layer.id === action.payload.id)?.[0];

      if (!layer) {
        return state;
      }

      layer.name = action.payload.name;
      layers = layers.filter(layer => layer.id !== action.payload.id);
      layers.push(layer);

      return { ...state, imported: layers };
    }
    case DELETE_LAYER: {
      const layers = state.imported.filter(layer => layer.id !== action.payload);

      const downloadProgress = { ...state.downloadedLayerProgress };
      delete downloadProgress[action.payload];

      return { ...state, imported: layers, downloadedLayerProgress: downloadProgress };
    }
    case LOGOUT_REQUEST:
      deleteLayerFiles()
        .then(() => console.info('Folder removed successfully'))
        .catch(error => console.info('An error occurred deleting files'));

      return initialState;
    default:
      return state;
  }
}

export function renameLayer(id: string, name: string): LayersAction {
  return {
    type: RENAME_LAYER,
    payload: {
      id,
      name
    }
  };
}

export function deleteLayer(id: string): LayersAction {
  return {
    type: DELETE_LAYER,
    payload: id
  };
}

export function getUserLayers() {
  return (dispatch: Dispatch, state: GetState) => {
    const url = `${Config.API_URL}/contextual-layer/?enabled=true`;
    const areas = state().areas.data;
    return dispatch({
      type: GET_LAYERS_REQUEST,
      meta: {
        offline: {
          effect: { url },
          commit: { type: GET_LAYERS_COMMIT, meta: { areas } },
          rollback: { type: GET_LAYERS_ROLLBACK }
        }
      }
    });
  };
}

export function clearImportContextualLayerState(): LayersAction {
  return {
    type: IMPORT_LAYER_CLEAR
  };
}

export function importLayer(layerFile: File): Thunk<Promise<void>> {
  return async (dispatch: Dispatch, state: GetState) => {
    dispatch({ type: IMPORT_LAYER_REQUEST });

    try {
      const importedFile: LayerFile = await importLayerFile(layerFile);
      const layerData: Layer = {
        enabled: true,
        id: layerFile.id,
        isPublic: false,
        name: layerFile.name || '',
        url: `${importedFile.path}/${importedFile.subFiles[0]}`,
        size: importedFile.size,
        isCustom: true,
        type: 'contextual_layer'
      };
      trackImportedContent('layer', layerFile.fileName, true, importedFile.size);
      dispatch({
        type: IMPORT_LAYER_COMMIT,
        payload: layerData
      });
    } catch (err) {
      // Fire and forget!
      dispatch({ type: IMPORT_LAYER_ROLLBACK, payload: err });
      trackImportedContent('layer', layerFile.fileName, false, layerFile.size);
      throw err;
    }
  };
}

export function syncLayers() {
  return (dispatch: Dispatch, state: GetState) => {
    const { synced, syncing } = state().layers;
    if (!synced && !syncing) {
      dispatch(getUserLayers());
    }
  };
}
