// @flow
import type { BasemapsAction, BasemapsState } from 'types/basemaps.types';
import type { File } from 'types/file.types';
import type { Dispatch, GetState, State, Thunk } from 'types/store.types';
import type { BasemapFile } from 'types/sharing.types';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

import { storeBasemap } from 'helpers/layer-store/import/importBasemapFile';

// Actions
const IMPORT_BASEMAP_REQUEST = 'basemaps/IMPORT_BASEMAP_REQUEST';
const IMPORT_BASEMAP_COMMIT = 'basemaps/IMPORT_BASEMAP_COMMIT';
const IMPORT_BASEMAP_CLEAR = 'basemaps/IMPORT_BASEMAP_CLEAR';
const IMPORT_BASEMAP_ROLLBACK = 'basemaps/IMPORT_BASEMAP_ROLLBACK';

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
      const imported = [...state.importedBasemaps, action.payload];
      return { ...state, importing: false, importError: null, importedBasemaps: imported };
    }
    case IMPORT_BASEMAP_CLEAR: {
      return { ...state, importing: false, importError: null };
    }
    case IMPORT_BASEMAP_ROLLBACK: {
      return { ...state, importing: false, importError: action.payload };
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
      const importedFile: BasemapFile = await storeBasemap(basemapFile);

      dispatch({
        type: IMPORT_BASEMAP_COMMIT,
        payload: importedFile
      });
    } catch (error) {
      dispatch({ type: IMPORT_BASEMAP_ROLLBACK, payload: error });
      throw error;
    }
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
