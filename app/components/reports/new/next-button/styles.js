import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255, 0.3)'
  },
  button: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
