// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';
import MapboxGL from '@react-native-mapbox-gl/maps';

// Actions
const ADD_BASEMAP = 'basemaps/ADD_BASEMAP';

// Constants
const allDefaultMapboxStyles = [
  [MapboxGL.StyleURL.Light, 'Light'],
  [MapboxGL.StyleURL.Dark, 'Dark'],
  [MapboxGL.StyleURL.Street, 'Street'],
  [MapboxGL.StyleURL.Satellite, 'Satellite']
];

const mapboxBasemaps: Array<Basemap> = allDefaultMapboxStyles.map(style => {
  return {
    isMapboxStyle: true,
    styleURL: style[0],
    id: style[0],
    name: style[1]
  };
});

export const DEFAULT_BASEMAP = mapboxBasemaps[0];

// Reducer
const initialState = {
  gfwBasemaps: mapboxBasemaps,
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
