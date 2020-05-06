// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';
import MapboxGL from '@react-native-mapbox-gl/maps';

// Actions
const ADD_BASEMAP = 'basemaps/ADD_BASEMAP';

// Constants
const allDefaultMapboxStyles = [
  [MapboxGL.StyleURL.Satellite, 'Satellite', require('assets/basemap_satellite.png')],
  [MapboxGL.StyleURL.Light, 'Light', require('assets/basemap_light.png')],
  [MapboxGL.StyleURL.Dark, 'Dark', require('assets/basemap_dark.png')],
  [MapboxGL.StyleURL.Street, 'Street', require('assets/basemap_street.png')]
];

const mapboxBasemaps: Array<Basemap> = allDefaultMapboxStyles.map(style => {
  return {
    isMapboxStyle: true,
    styleURL: style[0],
    id: style[0],
    name: style[1],
    image: style[2]
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
