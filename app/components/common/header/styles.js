import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  title: {
    color: Theme.fontColors.main,
    fontSize: 16,
    fontWeight: '700',
    paddingTop: 14
  },
  backButton: {
    left: 8,
    top: 28,
    position: 'absolute'
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16
  }
});
