import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEAE2'
  },
  map: {
    flex: 1
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    left: 0,
    right: 0,
    top: 0,
    height: 104,
    zIndex: 1,
    position: 'absolute',
    backgroundColor: 'transparent'
  },
  headerBg: {
    width: Theme.screen.width,
    height: 104,
    resizeMode: 'stretch',
    position: 'absolute',
    zIndex: 1,
    top: 0
  },
  headerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 21,
    fontWeight: '400',
    position: 'absolute',
    zIndex: 2,
    top: 16,
    left: 56,
    ...Platform.select({
      ios: {
        marginTop: 24
      }
    })
  },
  headerBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    ...Platform.select({
      ios: {
        marginTop: 24
      }
    })
  },
  signalNotice: {
    marginTop: 40,
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
    width: 18,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 164,
    zIndex: 3,
    position: 'absolute'
  },
  footerBg: {
    width: Theme.screen.width,
    height: 104,
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
  footerButton: {
    left: 8,
    right: 8,
    bottom: 28,
    position: 'absolute',
    zIndex: 2
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
  }
});
