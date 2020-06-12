// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';
import type { File } from 'types/file.types';
import type { LayerFile } from 'types/sharing.types';
import type { Dispatch, GetState, State, Thunk } from 'types/store.types';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import { trackImportedContent } from 'helpers/analytics';
import { importLayerFile } from 'helpers/layer-store/import/importLayerFile';

// Actions
export const IMPORT_BASEMAP_REQUEST = 'basemaps/IMPORT_BASEMAP_REQUEST';
export const IMPORT_BASEMAP_COMMIT = 'basemaps/IMPORT_BASEMAP_COMMIT';
const IMPORT_BASEMAP_CLEAR = 'basemaps/IMPORT_BASEMAP_CLEAR';
const IMPORT_BASEMAP_ROLLBACK = 'basemaps/IMPORT_BASEMAP_ROLLBACK';
const RENAME_BASEMAP = 'basemaps/RENAME_BASEMAP';
const DELETE_BASEMAP = 'basemaps/DELETE_BASEMAP';

// Reducer
const initialState = {
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
      return { ...state, importing: true, importError: null };
    }
    case IMPORT_BASEMAP_COMMIT: {
      const basemapToSave = action.payload;
      // Ignore the saved basemap if it already exists - this could happen when importing a layer for example
      const possiblyPreexistingBasemap = state.importedBasemaps.find(basemap => basemap.id === basemapToSave.id);
      if (possiblyPreexistingBasemap) {
        console.warn('3SC', `Ignore already existing basemap with ID ${basemapToSave.id}`);
        return state;
      }
      return {
        ...state,
        importing: false,
        importError: null,
        importedBasemaps: [...state.importedBasemaps, basemapToSave]
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
      return { ...state, importedBasemaps: basemaps };
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

/**
 * clearImportBasemapState - removed any retained state info to allow for a fresh import.
 */
export function clearImportBasemapState(): BasemapsAction {
  return {
    type: IMPORT_BASEMAP_CLEAR
  };
}
