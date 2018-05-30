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
  signalNotice: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  signalNoticeText: {
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: Theme.font,
    fontSize: 15,
    color: Theme.fontColors.white,
    marginLeft: 8,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 14,
    left: 32
  },
  geoLocationContainer: {
    width: 48,
    height: 48,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  geoLocation: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.color7,
    opacity: 0.5,
    position: 'absolute',
    zIndex: 1,
    top: 0
  },
  marker: {
    width: 18,
    height: 19,
    zIndex: 2,
    resizeMode: 'contain'
  },
  selectedMarkerIcon: {
    borderColor: 'rgba(85, 85, 85, 0.7)',
    backgroundColor: Theme.colors.color1
  },
  markerIconArea: {
    backgroundColor: 'rgba(255, 255, 255, 1)'
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
    height: 132,
    resizeMode: 'stretch',
    position: 'absolute',
    top: 0
  },
  buttonPanel: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 16
  },
  buttonPanelSelected: {
    flexDirection: 'column'
  },
  buttonPanelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
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
  btnContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 8
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
  }
});
