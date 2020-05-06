// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';

// Actions
const ADD_BASEMAP = 'basemaps/ADD_BASEMAP';

// Constants
export const GFWBasemaps: Array<Basemap> = [
  {
    isMapboxStyle: true,
    id: 'mapbox://styles/resourcewatch/cjww7iv8i07yx1cmjtgazn3r0?fresh=true',
    styleURL: 'mapbox://styles/resourcewatch/cjww7iv8i07yx1cmjtgazn3r0?fresh=true',
    name: 'Default',
    image: require('assets/basemap_default.png'),
    tileUrl: null
  },
  {
    isMapboxStyle: true,
    id: 'mapbox://styles/resourcewatch/cjww836hy1kep1co5xp717jek?fresh=true',
    styleURL: 'mapbox://styles/resourcewatch/cjww836hy1kep1co5xp717jek?fresh=true',
    name: 'Dark',
    image: require('assets/basemap_dark.png'),
    tileUrl: null
  },
  {
    isMapboxStyle: true,
    id: 'mapbox://styles/resourcewatch/cjww89e5j08o91cmjsbrd47qt?fresh=true',
    styleURL: 'mapbox://styles/resourcewatch/cjww89e5j08o91cmjsbrd47qt?fresh=true',
    name: 'Satellite',
    image: require('assets/basemap_satellite.png'),
    tileUrl: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
  },
  {
    isMapboxStyle: true,
    id: 'mapbox://styles/resourcewatch/cjww8drml27wc1cn3mk2872h9?fresh=true',
    styleURL: 'mapbox://styles/resourcewatch/cjww8drml27wc1cn3mk2872h9?fresh=true',
    name: 'Landsat',
    image: require('assets/basemap_landsat.png'),
    tileUrl: 'https://production-api.globalforestwatch.org/v2/landsat-tiles/2017/{z}/{x}/{y}'
  }
];

export const DEFAULT_BASEMAP = mapboxBasemaps[0];

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
