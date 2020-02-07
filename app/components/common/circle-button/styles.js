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
  gray: {
    backgroundColor: Theme.background.gray
  },
  red: {
    backgroundColor: Theme.colors.carnation
  },
  disabled: {
    backgroundColor: Theme.colors.veryLightPinkTwo
  }
});
