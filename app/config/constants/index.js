import Config from 'react-native-config';
import i18n from 'i18next';
import Theme from 'config/theme';
import { hexToRgb } from 'helpers/utils';

export const AREAS = {
  maxSize: 20000000000, // square meters
  alertRange: {
    // days from to get data
    viirs: 7,
    umd_as_it_happens: 365
  }
};
export const STORAGE = {
  app: {
    setup: '@App:setup',
    tutorial: '@App:tutorial',
    tutorialVersion: '@App:tutorialVersion'
  }
};

const devBasemap = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
const prodBasemap = `https://api.mapbox.com/styles/v1/forestwatcher/cj512vh3m0yth2rn62y69uoek/tiles/256/{z}/{x}/{y}?access_token=${
  Config.MAPBOX_TOKEN
}`;
export const MAPS = {
  basemap: __DEV__ ? devBasemap : prodBasemap,
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

export const TILE_SERVERS = {
  glad: 'http://wri-tiles.s3.amazonaws.com/glad_prod/tiles'
};

export const COUNTRIES = {
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

export const REACH = {
  WIFI: ['wifi'],
  MOBILE: ['cellular'],
  OTHER: ['bluetooth', 'ethernet', 'wimax'],
  NONE: ['none', 'unknown']
};

export const DATASETS = {
  VIIRS: 'viirs',
  GLAD: 'umd_as_it_happens'
};

export const DATASETSi18n = {
  VIIRS: i18n.t('datasets.viirs'),
  GLAD: i18n.t('datasets.umd_as_it_happens')
};

export const LAYERSi18n = {
  oilPalm: i18n.t('layers.oilPalm'),
  managedForests: i18n.t('layers.managedForests'),
  protectedAreas: i18n.t('layers.protectedAreas'),
  woodFiber: i18n.t('layers.woodFiber'),
  mining: i18n.t('layers.mining'),
  treeCoverLoss2014: i18n.t('layers.treeCoverLoss2014'),
  treeCoverLoss2015: i18n.t('layers.treeCoverLoss2015'),
  treeCoverLoss2016: i18n.t('layers.treeCoverLoss2016'),
  treeCoverLoss2017: i18n.t('layers.treeCoverLoss2017')
};

export const ALERTS_COLOR = {
  [DATASETS.GLAD]: Theme.colors.glad,
  [DATASETS.VIIRS]: Theme.colors.viirs
};

export const ALERTS_LEGEND = {
  [DATASETS.GLAD]: [
    {
      label: i18n.t('map.recent'),
      color: `rgba(${hexToRgb(Theme.colors.recent)}, 0.8)`
    }
  ],
  [DATASETS.VIIRS]: [],
  common: [
    {
      label: i18n.t('map.reported'),
      color: `rgba(${hexToRgb(Theme.colors.turtleGreen)}, 0.8)`
    }
  ]
};

export const GLAD_RECENT_RANGE = {
  range: 7,
  measure: 'days'
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

export const REDUCERS_SAVED_TO_REPORT = ['app', 'areas', 'layers'];
export const ACTIONS_SAVED_TO_REPORT = 5;

// Constants
export const GFW_BASEMAPS: Array<Basemap> = [
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

export const DEFAULT_BASEMAP = GFW_BASEMAPS[0];

export default {
  areas: AREAS,
  basemaps: GFW_BASEMAPS,
  storage: STORAGE,
  maps: MAPS,
  tileServers: TILE_SERVERS,
  countries: COUNTRIES,
  files: FILES,
  reports: REPORTS,
  status: STATUS,
  reach: REACH,
  datasets: DATASETS,
  actionsSavedToReport: ACTIONS_SAVED_TO_REPORT
};
