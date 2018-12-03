import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  defaultHeader: {
    alignSelf: 'flex-end',
    backgroundColor: Theme.background.main
  },
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  contentContainer: {
    flex: 1,
    width: Theme.screen.width,
    height: Theme.screen.height
  },
  mapHeader: {
    backgroundColor: 'transparent',
    paddingTop: 0
  }
});
