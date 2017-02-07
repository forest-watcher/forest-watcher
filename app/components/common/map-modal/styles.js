import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  header: {
    left: 0,
    right: 0,
    top: 0,
    height: 104,
    zIndex: 1
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
    marginLeft: Theme.margin.left,
    marginTop: 45,
    ...Platform.select({
      android: {
        marginTop: 30
      }
    })
  },
  closeIcon: {
    position: 'absolute',
    zIndex: 3,
    right: 10,
    top: 20
  },
  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    height: 104,
    zIndex: 1,
    position: 'absolute'
  },
  footerBg: {
    width: Theme.screen.width,
    height: 104,
    resizeMode: 'stretch',
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
    transform: [{ rotate: '180deg' }]
  },
  footerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 16,
    fontWeight: '400',
    position: 'absolute',
    zIndex: 2,
    bottom: 30,
    marginLeft: Theme.margin.left,
    opacity: 0.7
  }
});
