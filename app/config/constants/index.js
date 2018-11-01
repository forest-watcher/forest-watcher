import Config from 'react-native-config';
import i18n from 'locales';
import Theme from 'config/theme';
import { hexToRgb } from 'helpers/utils';

export const APP_NAME = 'Forest Watcher';

export const AREAS = {
  maxSize: 1500000000, // square meters
  alertRange: { // days from to get data
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
const prodBasemap = `https://api.mapbox.com/styles/v1/forestwatcher/cj512vh3m0yth2rn62y69uoek/tiles/256/{z}/{x}/{y}?access_token=${Config.MAPBOX_TOKEN}`;
export const MAPS = {
  lat: 27.568640,
  lng: -33.461281,
  basemap: __DEV__ ? devBasemap : prodBasemap,
  bbox: {
    type: 'Polygon',
    coordinates: [
      [-147.65625, -51.8357775204525],
      [-147.65625, 70.959697166864],
      [159.9609375, 70.959697166864],
      [159.9609375, -51.8357775204525],
      [-147.65625, -51.8357775204525]
    ]
  },
  cacheZoom: [
    {
      start: 3,
      end: 12
    }
  ]
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
  [DATASETS.GLAD]: Theme.colors.colorGlad,
  [DATASETS.VIIRS]: Theme.colors.colorViirs
};

export const ALERTS_LEGEND = {
  [DATASETS.GLAD]: [
    {
      label: i18n.t('map.recent'),
      color: `rgba(${hexToRgb(Theme.colors.colorRecent)}, 0.8)`
    }
  ],
  [DATASETS.VIIRS]: [],
  common: [
    {
      label: i18n.t('map.reported'),
      color: `rgba(${hexToRgb(Theme.colors.color1)}, 0.8)`
    }
  ]
};

export const GLAD_RECENT_RANGE = {
  range: 7,
  measure: 'days'
};

export const COORDINATES_FORMATS = {
  decimal: {
    label: i18n.t('settings.coordinatesDecimal'),
    value: 'decimal'
  },
  degrees: {
    label: i18n.t('settings.coordinatesDegrees'),
    value: 'degrees'
  },
  utm: {
    label: i18n.t('settings.coordinatesUtm'),
    value: 'utm'
  }
};

export const REDUCERS_SAVED_TO_REPORT = ['app', 'areas', 'layers'];
export const ACTIONS_SAVED_TO_REPORT = 5;

export default {
  appName: APP_NAME,
  areas: AREAS,
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

