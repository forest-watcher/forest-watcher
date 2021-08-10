import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

const CoordinateTextDefault = {
  fontFamily: Theme.font,
  fontSize: 12,
  textShadowColor: Theme.colors.greyishBrown,
  textShadowOffset: { width: 0, height: 0.5 },
  textShadowRadius: 1,
  color: 'white',
  textAlign: Platform.OS === 'ios' ? 'center' : undefined
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEAE2'
  },
  mapView: {
    flex: 1
  },
  customLocationFixed: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  customLocationTransparent: {
    opacity: 0.5
  },
  customLocationMarker: {
    height: 48,
    width: 48,
    bottom: 24
  },
  offlineNotice: {
    position: 'absolute',
    top: 20,
    right: 0,
    color: 'red',
    margin: 16
  },
  coordinateTextContainer: {
    justifyContent: Platform.OS === 'ios' ? 'center' : undefined,
    paddingHorizontal: 52,
    marginTop: Platform.OS === 'android' ? 20 : 10
  },
  coordinateText: {
    ...CoordinateTextDefault
  },
  coordinateTextLarge: {
    ...CoordinateTextDefault,
    fontSize: 16
  },
  selectedMarkerIcon: {
    borderColor: 'rgba(255, 255, 255, 1)',
    backgroundColor: Theme.colors.turtleGreen
  },
  routeVertex: {
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: Theme.colors.blue,
    borderRadius: 5,
    width: 10,
    height: 10
  },
  markerIconArea: {
    borderColor: 'rgba(255, 255, 255, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)'
  },
  header: {
    left: 0,
    right: 0,
    top: 0,
    zIndex: 3,
    position: 'absolute'
  },
  headerBg: {
    width: Theme.screen.width,
    height: 160,
    resizeMode: 'stretch',
    position: 'absolute',
    top: 0
  }
});

export const mapboxStyles = {
  destinationLine: {
    lineColor: Theme.colors.white,
    lineWidth: 3,
    lineOpacity: 0.8
  },
  areaOutline: {
    lineColor: Theme.colors.turtleGreen,
    lineCap: MapboxGL.LineJoin.Round,
    lineJoin: MapboxGL.LineJoin.Round,
    lineWidth: 3,
    lineOpacity: 0.8
  }
};
