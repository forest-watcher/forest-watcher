export const appName = 'Forest Watcher';

export const areas = {
  maxSize: 1500000000, // square meters
  alertRange: { // days from to get data
    viirs: 7,
    umd_as_it_happens: 365
  }
};
export const storage = {
  app: {
    setup: '@App:setup',
    tutorial: '@App:tutorial',
    tutorialVersion: '@App:tutorialVersion'
  }
};

export const maps = {
  lat: 27.568640,
  lng: -33.461281,
  basemap: 'http://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
  bbox: {
    type: 'Polygon',
    coordinates: [
      [
        [-147.65625, -51.8357775204525],
        [-147.65625, 70.959697166864],
        [159.9609375, 70.959697166864],
        [159.9609375, -51.8357775204525],
        [-147.65625, -51.8357775204525]
      ]
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

export const tileServers = {
  glad: 'http://wri-tiles.s3.amazonaws.com/glad_prod/tiles'
};

export const countries = {
  nameColumn: {
    en: 'name_engli',
    es: 'name_spani',
    fr: 'name_frenc',
    pt: 'name_engli',
    id: 'name_engli'
  }
};

export const files = {
  images: {
    alerts: 'images/alerts'
  },
  tiles: 'tiles'
};

export const reports = {
  default: 'defaultReport'
};

export const status = {
  draft: 'draft',
  complete: 'complete',
  uploaded: 'uploaded'
};

export const reach = {
  WIFI: ['WIFI'],
  MOBILE: ['MOBILE', 'MOBILE_DUN', 'MOBILE_HIPRI', 'MOBILE_MMS', 'MOBILE_SUPL', 'CELL'],
  OTHER: ['BLUETOOTH', 'DUMMY', 'ETHERNET', 'VPN', 'WIMAX'],
  NONE: ['NONE', 'UNKNOWN']
};

export const datasets = {
  VIIRS: 'viirs',
  GLAD: 'umd_as_it_happens'
};

export const coordinatesFormats = {
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
  appName,
  areas,
  storage,
  maps,
  tileServers,
  countries,
  files,
  reports,
  status,
  reach,
  datasets
};

