// @flow
import type { AlertDatasetConfig } from 'types/alerts.types';

import Config from 'react-native-config';
import i18n from 'i18next';
import Theme from 'config/theme';
import MapboxGL from '@react-native-mapbox-gl/maps';

import type { Layer, ContextualLayerRenderSpec } from 'types/layers.types';

export const AREAS = {
  maxSize: 20000000000 // square meters
};

export const MAPS = {
  smallPadding: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 20,
    paddingBottom: 20
  },
  cacheZoom: [
    {
      start: 3,
      end: 12
    }
  ]
};

// Forces mapbox layers to be in the correct order by specifying the index to add the layer.
// If a layer is added conditionally (during runtime), it is usually added above all other layers.
export const MAP_LAYER_INDEXES = {
  basemap: 1,
  areaOutline: 5,
  contextualLayer: 10,
  routes: 100,
  alerts: 150,
  reports: 180,
  userLocation: 200
};

// Defines the configuration for the BackgroundGeolocation module.
// Detailed documentation & library defaults are available here: https://github.com/mauron85/react-native-background-geolocation#configureoptions-success-fail
export const LOCATION_TRACKING = {
  stationaryRadius: 30,
  distanceFilter: 20,
  startOnBoot: false,
  stopOnTerminate: true,
  interval: 10000,
  fastestInterval: 5000,
  activitiesInterval: 10000,
  stopOnStillActivity: false,
  notificationTitle: i18n.t('routes.notification.title'),
  notificationText: i18n.t('routes.notification.message'),
  notificationIconColor: Theme.colors.white
};

const COUNTRIES = {
  nameColumn: {
    en: 'name_engli',
    es: 'name_spani',
    fr: 'name_frenc',
    pt: 'name_engli',
    id: 'name_engli'
  }
};

export const FILES = {
  images: {
    alerts: 'images/alerts'
  },
  maxFileSizeForLayerImport: 10485760,
  reports: 'reports',
  tiles: 'tiles'
};

export const REPORTS = {
  default: 'defaultReport',
  noGpsPosition: '0,0'
};

export const STATUS = {
  draft: 'draft',
  complete: 'complete',
  uploaded: 'uploaded'
};

export const DATASETS: { [slug: string]: AlertDatasetConfig } = {
  umd_as_it_happens: {
    id: 'umd_as_it_happens',
    nameKey: 'map.gladAlert',
    requestThreshold: 365,
    recencyThreshold: 7,
    filterThresholdOptions: [1, 2, 6, 12],
    filterThresholdUnits: 'months',
    iconPrefix: 'glad',
    color: Theme.colors.glad,
    colorRecent: Theme.colors.recent,
    colorReported: Theme.colors.report,
    reportNameId: 'GLAD'
  },
  viirs: {
    id: 'viirs',
    nameKey: 'map.viirsAlert',
    requestThreshold: 7,
    recencyThreshold: 0,
    filterThresholdOptions: [1, 2, 6, 12],
    filterThresholdUnits: 'days',
    iconPrefix: 'viirs',
    color: Theme.colors.viirs,
    colorRecent: Theme.colors.recent,
    colorReported: Theme.colors.viirsReported,
    reportNameId: 'VIIRS'
  }
};

export const COORDINATES_FORMATS = {
  decimal: {
    labelKey: 'settings.coordinatesDecimal',
    value: 'decimal'
  },
  degrees: {
    labelKey: 'settings.coordinatesDegrees',
    value: 'degrees'
  },
  utm: {
    labelKey: 'settings.coordinatesUtm',
    value: 'utm'
  }
};

export const ACTIONS_SAVED_TO_REPORT = 5;

// Constants
export const GFW_BASEMAPS: Array<Layer> = [
  {
    isCustom: false,
    id: MapboxGL.StyleURL.SatelliteStreet,
    styleURL: MapboxGL.StyleURL.SatelliteStreet,
    name: 'satellite',
    image: require('assets/basemap_mapbox_satellite.png'),
    url: null,
    type: 'basemap'
  },
  {
    isCustom: false,
    id: 'mapbox://styles/resourcewatch/cjww7iv8i07yx1cmjtgazn3r0?fresh=true',
    styleURL: 'mapbox://styles/resourcewatch/cjww7iv8i07yx1cmjtgazn3r0?fresh=true',
    name: 'default',
    image: require('assets/basemap_default.png'),
    url: null,
    type: 'basemap'
  },
  {
    isCustom: false,
    id: 'mapbox://styles/resourcewatch/cjww836hy1kep1co5xp717jek?fresh=true',
    styleURL: 'mapbox://styles/resourcewatch/cjww836hy1kep1co5xp717jek?fresh=true',
    name: 'dark',
    image: require('assets/basemap_dark.png'),
    url: null,
    type: 'basemap'
  }
];

// A map from a contextual layer's ID to metadata provided to allow it to be rendered in MapBox
// this allows us to update styling e.t.c. without the user having to delete and re-add GFW contextual layers!
export const GFW_CONTEXTUAL_LAYERS_METADATA: { [string]: ContextualLayerRenderSpec } = {
  'bd2798d1-c771-4bff-84d9-c4d69d3b3121': {
    isShareable: false,
    maxZoom: 12,
    minZoom: 3,
    tileFormat: 'raster'
  },
  'c1c306a3-31b6-409a-acf0-2a8f09e28363': {
    isShareable: false,
    maxZoom: 12,
    minZoom: 3,
    tileFormat: 'raster'
  },
  'f84af037-4e4f-41cf-a053-94a606071232': {
    isShareable: false,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        filter: [
          'all',
          ['in', ['get', 'fungsikawa'], ['literal', [1, 1002, 10021, 10022, 10023, 10024, 10025, 10026, 100201]]]
        ],
        paint: {
          'fill-color': '#C489FD',
          'fill-opacity': 0.9
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: [
          'all',
          ['in', ['get', 'fungsikawa'], ['literal', [1, 1002, 10021, 10022, 10023, 10024, 10025, 10026, 100201]]]
        ],
        paint: {
          'line-color': '#FFF',
          'line-opacity': 0.2,
          'line-width': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [100202, 100251, 100241, 100221, 100211]]]],
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': 0.3
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [100202, 100251, 100241, 100221, 100211]]]],
        paint: {
          'line-color': '#FF00FF',
          'line-opacity': 0.9,
          'line-width': 1.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['in', ['get', 'fungsikawa'], ['literal', [1001]]],
        paint: {
          'fill-color': '#00FF7B',
          'fill-opacity': 0.9
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['in', ['get', 'fungsikawa'], ['literal', [1001]]],
        paint: {
          'line-color': '#00FF7B',
          'line-opacity': 0.2,
          'line-width': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1003]]]],
        paint: {
          'fill-color': '#FFFEAA',
          'fill-opacity': 0.9
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1003]]]],
        paint: {
          'line-color': '#FFFEAA',
          'line-opacity': 0.2,
          'line-width': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1004]]]],
        paint: {
          'fill-color': '#C4FBAF',
          'fill-opacity': 0.9
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1004]]]],
        paint: {
          'line-color': '#C4FBAF',
          'line-opacity': 0.2,
          'line-width': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1005]]]],
        paint: {
          'fill-color': '#FEA189',
          'fill-opacity': 0.9
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1005]]]],
        paint: {
          'line-color': '#FEA189',
          'line-opacity': 0.2,
          'line-width': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1007]]]],
        paint: {
          'fill-color': '#D8D8D8',
          'fill-opacity': 0.9
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['in', ['get', 'fungsikawa'], ['literal', [1007]]]],
        paint: {
          'line-color': '#D8D8D8',
          'line-opacity': 0.2,
          'line-width': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      }
    ]
  },
  'caa9b9b7-5dec-4ad6-adbf-d7c2965c9371': {
    isShareable: false,
    maxZoom: 9,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        filter: ['==', 'type', 'Indicative Areas'],
        paint: {
          'fill-color': '#9c9c9c',
          'fill-opacity': 0.8
        },
        'source-layer': 'landmark_land_rights',
        type: 'fill'
      },
      {
        filter: ['==', 'type', 'Indicative Areas'],
        paint: {
          'line-color': '#9c9c9c',
          'line-opacity': 1
        },
        'source-layer': 'landmark_land_rights',
        type: 'line'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Acknowledged by govt'], ['==', 'identity', 'Indigenous']],
        paint: {
          'fill-color': '#bf6938',
          'fill-opacity': 0.8
        },
        'source-layer': 'landmark_land_rights',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Acknowledged by govt'], ['==', 'identity', 'Indigenous']],
        paint: {
          'line-color': '#bf6938',
          'line-opacity': 1
        },
        'source-layer': 'landmark_land_rights',
        type: 'line'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Not acknowledged by govt'], ['==', 'identity', 'Indigenous']],
        paint: {
          'fill-color': '#f3aa72',
          'fill-opacity': 0.8
        },
        'source-layer': 'landmark_land_rights',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Not acknowledged by govt'], ['==', 'identity', 'Indigenous']],
        paint: {
          'line-color': '#f3aa72',
          'line-opacity': 1
        },
        'source-layer': 'landmark_land_rights',
        type: 'line'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Acknowledged by govt'], ['==', 'identity', 'Community']],
        paint: {
          'fill-color': '#2C5682',
          'fill-opacity': 0.8
        },
        'source-layer': 'landmark_land_rights',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Acknowledged by govt'], ['==', 'identity', 'Community']],
        paint: {
          'line-color': '#2C5682',
          'line-opacity': 1
        },
        'source-layer': 'landmark_land_rights',
        type: 'line'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Not acknowledged by govt'], ['==', 'identity', 'Community']],
        paint: {
          'fill-color': '#407ebe',
          'fill-opacity': 0.8
        },
        'source-layer': 'landmark_land_rights',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'form_rec', 'Not acknowledged by govt'], ['==', 'identity', 'Community']],
        paint: {
          'line-color': '#407ebe',
          'line-opacity': 1
        },
        'source-layer': 'landmark_land_rights',
        type: 'line'
      }
    ]
  },
  '51aad76b-e884-44e0-82a4-d3b2f87a052d': {
    isShareable: false,
    maxZoom: 18,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        paint: {
          'line-color': '#adadad',
          'line-width': 0.3,
          'line-opacity': 0.5
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        paint: {
          'fill-opacity': 1,
          'fill-color': '#8da0cb'
        },
        'source-layer': 'layer0',
        type: 'fill'
      }
    ]
  },
  'fcd10026-e892-4fb8-8d79-8d76e3b94005': {
    isShareable: true,
    maxZoom: 19,
    minZoom: 2,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        paint: {
          'fill-color': '#fbb685',
          'fill-opacity': 0.7
        },
        'source-layer': 'mining_v27022019',
        type: 'fill'
      },
      {
        paint: {
          'line-color': '#fbb685',
          'line-opacity': 1,
          'line-width': 1
        },
        'source-layer': 'mining_v27022019',
        type: 'line'
      }
    ]
  },
  '0911abc4-d861-4d7a-84d6-0fa07b51d7d8': {
    isShareable: true,
    maxZoom: 19,
    minZoom: 2,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        paint: {
          'fill-color': '#ee9587',
          'fill-opacity': 0.7
        },
        'source-layer': 'layer0',
        type: 'fill'
      }
    ]
  },
  'e37f881b-ed2e-485b-b194-6a6829aaff2e': {
    isShareable: true,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        paint: {
          'fill-opacity': 0.7
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        paint: {
          'line-opacity': 0,
          'line-width': 0
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'line'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'II']],
        paint: {
          'fill-color': '#0f3b82'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'III']],
        paint: {
          'fill-color': '#c9ddff'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'IV']],
        paint: {
          'fill-color': '#b9b2a1'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'Ia']],
        paint: {
          'fill-color': '#5ca2d1'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'Ib']],
        paint: {
          'fill-color': '#3e7bb6'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'Not Applicable']],
        paint: {
          'fill-color': '#eed54c'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'Not Assigned']],
        paint: {
          'fill-color': '#e7ab36'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'Not Reported']],
        paint: {
          'fill-color': '#fa894b'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'V']],
        paint: {
          'fill-color': '#ae847e'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'iucn_cat', 'VI']],
        paint: {
          'fill-color': '#daa89b'
        },
        'source-layer': 'wdpa_protected_areas_201909',
        type: 'fill'
      }
    ]
  },
  '5ce140d9-260b-4e42-8b15-bd62193a5955': {
    isShareable: false,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        filter: ['all', ['==', ['get', 'rspo_cert'], 'True']],
        paint: {
          'fill-color': '#ffa146',
          'fill-opacity': 0.7
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['==', ['get', 'rspo_cert'], 'True']],
        paint: {
          'line-color': '#ffa146',
          'line-opacity': 1,
          'line-width': 1
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['==', ['get', 'rspo_cert'], 'False']],
        paint: {
          'fill-color': '#ff6361',
          'fill-opacity': 0.7
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['==', ['get', 'rspo_cert'], 'False']],
        paint: {
          'line-color': '#ff6361',
          'line-opacity': 1,
          'line-width': 1
        },
        'source-layer': 'layer0',
        type: 'line'
      },
      {
        filter: ['all', ['==', ['get', 'rspo_cert'], 'Unknown']],
        paint: {
          'fill-color': '#bc5090',
          'fill-opacity': 0.7
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['==', ['get', 'rspo_cert'], 'Unknown']],
        paint: {
          'line-color': '#bc5090',
          'line-opacity': 1,
          'line-width': 1
        },
        'source-layer': 'layer0',
        type: 'line'
      }
    ]
  },
  '82229960-13c2-4810-84e7-bdd4812d4578': {
    isShareable: false,
    tileFormat: 'vector',
    vectorMapLayers: [
      {
        filter: ['all', ['==', 'source_typ', 'government']],
        paint: {
          'fill-color': '#8A2F1D',
          'fill-opacity': 0.7
        },
        'source-layer': 'layer0',
        type: 'fill'
      },
      {
        filter: ['all', ['==', 'source_typ', 'private sector']],
        paint: {
          'fill-color': '#EB5B31',
          'fill-opacity': 0.7
        },
        'source-layer': 'layer0',
        type: 'fill'
      }
    ]
  }
};

// These are hard-coded versions of data hosted in the layers API, you can use the `id` parameter to fetch
// the full data for each (If you suspect something is wrong/missing) using: https://api.resourcewatch.org/v1/layer/{id}
export const GFW_CONTEXTUAL_LAYERS: Array<Layer> = [
  {
    id: 'bd2798d1-c771-4bff-84d9-c4d69d3b3121',
    name: 'biodiversityIntactness',
    url: 'https://api.resourcewatch.org/v1/layer/bd2798d1-c771-4bff-84d9-c4d69d3b3121/tile/gee/{z}/{x}/{y}',
    type: 'contextual_layer'
  },
  {
    id: 'c1c306a3-31b6-409a-acf0-2a8f09e28363',
    name: 'biodiversitySignificance',
    url: 'https://api.resourcewatch.org/v1/layer/c1c306a3-31b6-409a-acf0-2a8f09e28363/tile/gee/{z}/{x}/{y}',
    type: 'contextual_layer'
  },
  /*{
    id: 'f84af037-4e4f-41cf-a053-94a606071232',
    description: 'Indicates the Indonesian government’s designation of legal forest area.',
    name: 'indonesiaForestArea',
    isGFW: true,
    url:
      'https://cartocdn-gusc-a.global.ssl.fastly.net/wri-01/api/v1/map/875b5073c8d5640411d39d04a6c03e59:1529255267242/{z}/{x}/{y}.mvt'
  },*/
  {
    id: 'caa9b9b7-5dec-4ad6-adbf-d7c2965c9371',
    description:
      'Boundaries of areas over which indigenous peoples or local communities enjoy rights to the land and certain resources. Only select countries are included, and dates of data displayed vary by country.',
    name: 'landmarks',
    url: 'https://tiles.globalforestwatch.org/landmark_land_rights/v20191111/default/{z}/{x}/{y}.pbf',
    type: 'contextual_layer'
  },
  {
    id: '51aad76b-e884-44e0-82a4-d3b2f87a052d',
    description:
      'Boundaries of forested areas allocated by governments to companies for harvesting timber and other wood products.',
    name: 'logging',
    url:
      'https://cartocdn-gusc-a.global.ssl.fastly.net/wri-01/api/v1/map/aa3157cf3a5b0acc1f78b48899fb7a02:1548761157303/{z}/{x}/{y}.mvt',
    type: 'contextual_layer'
  },
  {
    id: 'fcd10026-e892-4fb8-8d79-8d76e3b94005',
    description: 'Mining Areas',
    name: 'miningConcessions',
    tileFormat: 'vector',
    url: 'mapbox://resourcewatch.3259d78x',
    type: 'contextual_layer'
  },
  /*{
    id: '0911abc4-d861-4d7a-84d6-0fa07b51d7d8',
    description: 'Oil palm areas',
    name: 'oilPalmConcessions',
    isGFW: true,
    url: ''
  },*/
  {
    id: 'e37f881b-ed2e-485b-b194-6a6829aaff2e',
    description: 'Legally protected areas by IUCN category. Updated monthly.',
    name: 'wdpa',
    tileFormat: 'vector',
    url: 'https://tiles.globalforestwatch.org/wdpa_protected_areas/v201909/mvt/{z}/{x}/{y}',
    type: 'contextual_layer'
  },
  /*{
    id: '5ce140d9-260b-4e42-8b15-bd62193a5955',
    description:
      'This data layer displays the concession boundaries of Roundtable on Sustainable Palm Oil (RSPO) member companies through December 2017, including both certified and non-certified concessions, as well as concessions where the certification status is unknown. The concession boundaries were provided to the RSPO by member companies.',
    name: 'rspo',
    isGFW: true,
    url:
      'https://cartocdn-gusc-a.global.ssl.fastly.net/wri-01/api/v1/map/4cec6a801dc76cb77fbf5123efd7581f:1529255245810/{z}/{x}/{y}.mvt'
  },*/
  {
    id: '82229960-13c2-4810-84e7-bdd4812d4578',
    description: 'Wood fiber plantation areas',
    name: 'woodFiberConcessions',
    url:
      'https://cartocdn-gusc-a.global.ssl.fastly.net/wri-01/api/v1/map/1805b7c9ae919f705548dfb470679f8a:1569405047170/{z}/{x}/{y}.mvt',
    type: 'contextual_layer'
  }
];

export const DEFAULT_BASEMAP = GFW_BASEMAPS[0];

export const ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS = ['json', 'geojson', 'topojson', 'gpx', 'zip', 'kmz', 'kml'];
export const ACCEPTED_FILE_TYPES_BASEMAPS = ['mbtiles'];

const LAYER_MAX_NAME_LENGTH = 40;

export const GFW_SIGN_UP_LINK = 'https://www.globalforestwatch.org/my-gfw';
export const GFW_FORGOT_PASSWORD_LINK = `${Config.API_AUTH}/auth/reset-password`;

export default {
  areas: AREAS,
  basemaps: GFW_BASEMAPS,
  maps: MAPS,
  countries: COUNTRIES,
  files: FILES,
  reports: REPORTS,
  status: STATUS,
  datasets: DATASETS,
  actionsSavedToReport: ACTIONS_SAVED_TO_REPORT,
  layerMaxNameLength: LAYER_MAX_NAME_LENGTH
};
