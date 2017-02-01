import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  main: {
    flex: 1
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
