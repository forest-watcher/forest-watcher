import { StyleSheet, Platform } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        height: 64
      },
      android: {
        height: 44
      }
    })
  },
  title: {
    color: Theme.fontColors.main,
    fontSize: 16,
    fontWeight: '700',
    ...Platform.select({
      ios: {
        paddingTop: 14
      },
      android: {
        paddingTop: 0
      }
    })
  },
  backButton: {
    left: 8,
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 28
      },
      android: {
        top: 10
      }
    })
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16
  }
});
