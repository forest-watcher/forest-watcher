import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEAE2'
  },
  map: {
    zIndex: 0,
    flex: 1,
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: -26,
    top: 0
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
    width: 48
  },
  offlineNotice: {
    position: 'absolute',
    top: 20,
    right: 0,
    color: 'red',
    margin: 16
  },
  coordinateText: {
    color: 'white',
    fontSize: 16,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 45
  },
  selectedMarkerIcon: {
    borderColor: 'rgba(255, 255, 255, 1)',
    backgroundColor: Theme.colors.turtleGreen
  },
  routeVertex: {
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: '#2e8dc7',
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
    marginHorizontal: 16,
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
    height: 100,
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
  btnLeft: {
    marginRight: 8
  },
  hidden: {
    opacity: 0,
    height: 0
  },
  forceRefresh: {
    marginTop: -1,
    paddingTop: 1
  }
});
