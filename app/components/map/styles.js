import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';

const defaultPin = require('/assets/defaultPin.png');

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
  coordinateText: {
    fontFamily: Theme.font,
    fontSize: 12,
    textShadowColor: Theme.colors.greyishBrown,
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
    color: 'white',
    lineHeight: 16,
    justifyContent: Platform.OS === 'ios' ? 'center' : undefined,
    left: Platform.OS === 'ios' ? 0 : 52,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    textAlign: Platform.OS === 'ios' ? 'center' : undefined,
    top: 45
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
    height: 164,
    zIndex: 3,
    position: 'absolute'
  },
  headerBg: {
    width: Theme.screen.width,
    height: 160,
    resizeMode: 'stretch',
    position: 'absolute',
    top: 0
  },
  buttonPanel: {
    flexDirection: 'row-reverse', // See jsx comment to understand better
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 16,
    paddingBottom: 16
  },
  buttonPanelSelected: {
    flexDirection: 'column'
  },
  buttonPanelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonPanelTray: {
    height: 56,
    backgroundColor: 'rgba(0,0,0,0.3)'
  },
  btnMarginContainer: {
    marginTop: 8
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    position: 'absolute'
  },
  footerBGContainer: {
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    position: 'absolute'
  },
  footerBg: {
    width: Theme.screen.width,
    height: 100,
    resizeMode: 'stretch',
    position: 'absolute',
    bottom: 0,
    transform: [{ rotate: '180deg' }]
  },
  footerSubtitle: {
    bottom: 20
  },
  btnReport: {
    flex: 1
  },
  hidden: {
    opacity: 0,
    height: 0
  },
  forceRefresh: {
    marginTop: -1,
    paddingTop: 1
  },
  locationErrorBanner: {
    marginHorizontal: 25,
    marginBottom: -64 // shows as same position as infoBanner
  },
  infoBanner: {
    marginHorizontal: 25,
    marginBottom: 39
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
  },
  icon: {
    iconImage: defaultPin,
    iconAllowOverlap: true
  },
  geoJsonStyleSpec: {
    fillColor: ['case', ['has', 'fill'], ['get', 'fill'], Theme.colors.turtleGreen],
    fillOpacity: ['case', ['has', 'fill-opacity'], ['get', 'fill-opacity'], 0.4],
    lineColor: ['case', ['has', 'stroke'], ['get', 'stroke'], Theme.colors.turtleGreen],
    lineWidth: ['case', ['has', 'stroke-width'], ['get', 'stroke-width'], 3],
    lineOpacity: ['case', ['has', 'stroke-opacity'], ['get', 'stroke-opacity'], 0.8]
  }
};
