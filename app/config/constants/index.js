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

export default {
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
