import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  defaultHeader: {
    flex: 1,
    backgroundColor: Theme.background.main,
    ...Platform.select({
      ios: {
        paddingTop: 80
      },
      android: {
        paddingTop: 60
      }
    })
  },
  mapHeader: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0
  }
});
