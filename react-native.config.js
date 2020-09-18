module.exports = {
  dependencies: {
    '@mauron85/react-native-background-geolocation': {
      platforms: {
        android: null // disable Android platform, other platforms will still autolink if provided
      }
    },
    'react-native-mbtiles': {
      platforms: {
        android: null
      }
    }
  }
};
