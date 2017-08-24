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

export const MAPS = {
  lat: 27.568640,
  lng: -33.461281,
  basemap: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
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
      start: 8,
      end: 15
    },
    {
      start: 16,
      end: 16
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
  default: 'defaultReport'
};

export const STATUS = {
  draft: 'draft',
  complete: 'complete',
  uploaded: 'uploaded'
};

export const REACH = {
  WIFI: ['WIFI'],
  MOBILE: ['MOBILE', 'MOBILE_DUN', 'MOBILE_HIPRI', 'MOBILE_MMS', 'MOBILE_SUPL', 'CELL'],
  OTHER: ['BLUETOOTH', 'DUMMY', 'ETHERNET', 'VPN', 'WIMAX'],
  NONE: ['NONE', 'UNKNOWN']
};

export const DATASETS = {
  VIIRS: 'viirs',
  GLAD: 'umd_as_it_happens'
};

export const COORDINATES_FORMATS = {
  decimal: {
    label: 'settings.coordinatesDecimal',
    value: 'decimal'
  },
  degrees: {
    label: 'settings.coordinatesDegrees',
    value: 'degrees'
  }
};

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
  datasets: DATASETS
};

