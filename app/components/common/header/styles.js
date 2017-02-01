import { StyleSheet, Platform } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        height: 114
      },
      android: {
        height: 94
      }
    })
  },
  title: {
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 0,
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
