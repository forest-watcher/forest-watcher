import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
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
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
