// @flow
import type { GFWLayersState, LayersAction } from 'types/layers.types';
import type { Dispatch, GetState, State } from 'types/store.types';

import Config from 'react-native-config';

import { LOGOUT_REQUEST } from 'redux-modules/user';
import { PERSIST_REHYDRATE } from '@redux-offline/redux-offline/lib/constants';

const GET_GFW_LAYERS_REQUEST = 'layers/GET_GFW_LAYERS_REQUEST';
const GET_GFW_LAYERS_COMMIT = 'layers/GET_GFW_LAYERS_COMMIT';
const GET_GFW_LAYERS_ROLLBACK = 'layers/GET_GFW_LAYERS_ROLLBACK';

// Reducer
const initialState = {
  data: [],
  error: null,
  loadedPage: null,
  total: null,
  fullyLoaded: false,
  syncing: false,
  paginating: false
};

export default function reducer(state: GFWLayersState = initialState, action: LayersAction) {
  switch (action.type) {
    case PERSIST_REHYDRATE: {
      return {
        ...state,
        error: null,
        fullyLoaded: false,
        loadedPage: null,
        syncing: false,
        total: null,
        paginating: false
      };
    }
    case GET_GFW_LAYERS_REQUEST: {
      return {
        ...state,
        error: null,
        paginating: action.meta.offline.commit.meta.page !== 0,
        syncing: true,
        fullyLoaded: false
      };
    }
    case GET_GFW_LAYERS_COMMIT: {
      let data;
      if (action.meta.page === 0) {
        data = action.payload.data;
      } else {
        data = [...state.data, ...action.payload.data];
      }
      return {
        ...state,
        data,
        fullyLoaded: action.payload.meta['total-pages'] === action.meta.page + 1,
        paginating: false,
        syncing: false,
        error: null,
        loadedPage: action.meta.page,
        total: action.payload.meta['total-items']
      };
    }
    case GET_GFW_LAYERS_ROLLBACK: {
      return { ...state, syncing: false, paginating: false, error: action.payload };
    }
    case LOGOUT_REQUEST: {
      return initialState;
    }
    default:
      return state;
  }
}

/**
  Fetches GFW layers from the provided endpoint
  @argument {number} page - The page of the results to load: zero-based, but converted to 1-based page size is hard-coded to 10
  @argument {?string} searchTerm - A search term to send with the request to the server
 */
export function getGFWLayers(page: number = 0, searchTerm?: ?string) {
  return (dispatch: Dispatch, state: GetState) => {
    // We don't provide a page size for the moment as we will be filtering locally
    // and this could cause weird pagination if we don't load in as many results as possible.
    // This may need re-visiting in the future, if GFW set us up our own app with only
    // layers that we can guarantee we will be able to render, or give us beter filtering!
    let url = `${Config.LAYERS_API_URL}/layer?page[size]=100&page[number]=${page + 1}&app=gfw`;
    if (searchTerm) {
      url += `&name=${searchTerm}`;
    }
    return dispatch({
      type: GET_GFW_LAYERS_REQUEST,
      meta: {
        offline: {
          effect: { url, deserialize: false },
          commit: { type: GET_GFW_LAYERS_COMMIT, meta: { page } },
          rollback: { type: GET_GFW_LAYERS_ROLLBACK, meta: { page } }
        }
      }
    });
  };
}
