import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  defaultHeader: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingTop: 88
  },
  mapHeader: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 0
  }
});
