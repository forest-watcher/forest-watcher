// @flow
import type { Basemap, BasemapsAction, BasemapsState } from 'types/basemaps.types';

// Actions
const ADD_BASEMAP = 'basemaps/ADD_BASEMAP';

// Constants
const allDefaultMapboxStyles = [
  [
    'mapbox://styles/resourcewatch/cjww7iv8i07yx1cmjtgazn3r0?fresh=true',
    'Default',
    require('assets/basemap_default.png')
  ],
  ['mapbox://styles/resourcewatch/cjww836hy1kep1co5xp717jek?fresh=true', 'Dark', require('assets/basemap_dark.png')],
  [
    'mapbox://styles/resourcewatch/cjww89e5j08o91cmjsbrd47qt?fresh=true',
    'Satellite',
    require('assets/basemap_satellite.png'),
    'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
  ],
  [
    'mapbox://styles/resourcewatch/cjww8drml27wc1cn3mk2872h9?fresh=true',
    'Landsat',
    require('assets/basemap_landsat.png'),
    'https://production-api.globalforestwatch.org/v2/landsat-tiles/2017/{z}/{x}/{y}'
  ]
];

const mapboxBasemaps: Array<Basemap> = allDefaultMapboxStyles.map(style => {
  return {
    isMapboxStyle: true,
    styleURL: style[0],
    id: style[0],
    name: style[1],
    image: style[2],
    tileUrl: style.length > 3 ? style[3] : undefined
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
