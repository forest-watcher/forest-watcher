import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  header: {
    left: 0,
    right: 0,
    top: 0,
    height: 90,
    justifyContent: 'center',
    position: 'absolute',
    zIndex: 1
  },
  headerTitle: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 21,
    fontWeight: '400',
    marginLeft: Theme.margin.left
  },
  map: {
    ...StyleSheet.absoluteFillObject
  }
});
