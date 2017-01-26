import config from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: config.background.main
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});
