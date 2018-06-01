import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.background.secondary
  },
  light: {
    backgroundColor: Theme.background.white
  },
  disabled: {
    backgroundColor: Theme.colors.color6
  }
});
