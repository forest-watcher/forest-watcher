import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    position: 'relative'
  },
  containerFloat: {
    paddingTop: 80
  },
  containerFull: {
    paddingTop: 0
  },
  buttonPos: {
    position: 'absolute',
    bottom: 50,
    left: 8,
    right: 8
  }
});
