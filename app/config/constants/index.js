export default {
  appName: 'Forest Watcher',
  areas: {
    maxSize: 1500000000, // square meters
    alertRange: { // days from to get data
      viirs: 7,
      umd_as_it_happens: 365
    }
  },
  storage: {
    app: {
      setup: '@App:setup',
      tutorial: '@App:tutorial',
      tutorialVersion: '@App:tutorialVersion'
    }
  },
  maps: {
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
  },
  tileServers: {
    glad: 'http://wri-tiles.s3.amazonaws.com/glad_prod/tiles'
  },
  countries: {
    nameColumn: {
      en: 'name_engli',
      es: 'name_spani',
      fr: 'name_frenc',
      pt: 'name_engli',
      id: 'name_engli'
    }
  },
  files: {
    images: {
      alerts: 'images/alerts'
    },
    tiles: 'tiles'
  },
  reports: {
    default: 'defaultReport'
  },
  status: {
    draft: 'draft',
    complete: 'complete',
    uploaded: 'uploaded'
  },
  reach: {
    WIFI: ['WIFI'],
    MOBILE: ['MOBILE', 'MOBILE_DUN', 'MOBILE_HIPRI', 'MOBILE_MMS', 'MOBILE_SUPL', 'CELL'],
    OTHER: ['BLUETOOTH', 'DUMMY', 'ETHERNET', 'VPN', 'WIMAX'],
    NONE: ['NONE', 'UNKNOWN']
  },
  datasets: {
    VIIRS: 'viirs',
    GLAD: 'umd_as_it_happens'
  }
};

