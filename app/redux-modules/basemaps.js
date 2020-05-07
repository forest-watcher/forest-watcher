// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';

// Actions
const ADD_BASEMAP = 'basemaps/ADD_BASEMAP';

// Reducer
const initialState = {
  importedBasemaps: []
};

export default function reducer(state: BasemapsState = initialState, action: BasemapsAction): BasemapsState {
  switch (action.type) {
    case ADD_BASEMAP: {
      return { ...state, importedBasemaps: [...state.importedBasemaps, action.payload.basemap] };
    }
    default:
      return state;
  }
}

export function addBasemap(basemap: Basemap): BasemapsAction {
  return {
    type: ADD_BASEMAP,
    payload: {
      basemap: basemap
    }
  };
}
