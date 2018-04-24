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
  loaderContainer: {
    flex: 1,
    backgroundColor: '#EDEAE2',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    position: 'absolute',
    zIndex: 5
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  signalNotice: {
    marginBottom: 4,
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  signalNoticeText: {
    fontWeight: '400',
    fontStyle: 'italic',
    fontFamily: Theme.font,
    fontSize: 17,
    color: Theme.fontColors.white,
    marginLeft: 16,
    backgroundColor: 'transparent'
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
  markerIcon: {
    width: 18,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 1)'
  },
  markerIconArea: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'transparent'
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
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    position: 'absolute'
  },
  footerRow: {
    flex: 1,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minHeight: 60
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
  footerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 17,
    fontWeight: '500',
    position: 'absolute',
    zIndex: 2,
    bottom: 40,
    marginLeft: Theme.margin.left,
    opacity: 1,
    backgroundColor: 'transparent'
  },
  footerSubtitle: {
    bottom: 20
  },
  btnContainer: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8
  },
  footerButton: {
    height: 64,
    marginLeft: 8,
    marginRight: 8,
    zIndex: 4
  },
  footerButton1: {
    marginBottom: 4
  },
  footerButton2: {
    marginTop: 4
  },
  coordinateDistanceText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 14,
    fontWeight: '400',
    marginLeft: 14,
    backgroundColor: 'transparent',
    lineHeight: 13
  },
  currentPosition: {
    paddingTop: 3,
    position: 'relative'
  },
  btnRemoveCurrent: {
    width: 20,
    height: 20,
    position: 'absolute',
    right: 0,
    bottom: 0
  },
  btnRemoveCurrentText: {
    fontSize: 18,
    borderTopColor: '#CCCCCC',
    padding: 0
  },
  footerReport: {
    paddingLeft: 8
  }
});
