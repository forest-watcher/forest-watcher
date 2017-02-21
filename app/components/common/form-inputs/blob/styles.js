import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Theme.screen.height,
    width: Theme.screen.width
  },
  capture: {
    width: 64,
    height: 64,
    backgroundColor: Theme.background.secondary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24
  }
});
