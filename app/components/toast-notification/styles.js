import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  view: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
    backgroundColor: Theme.background.white,
    flexDirection: 'column',
    width: Theme.screen.width,
    shadowColor: Theme.colors.greyishBrown,
    shadowRadius: 5,
    shadowOffset: { height: 2 },
    shadowOpacity: 0.4
  },
  internalView: {
    flexDirection: 'column',
    ...Platform.select({
      android: {
        paddingTop: 16
      },
      ios: {
        paddingTop: 32
      }
    })
  },
  text: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  description: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12,
    fontWeight: '400',
    paddingTop: 4
  },
  success: {
    backgroundColor: Theme.background.secondary
  },
  successText: {
    color: Theme.fontColors.white
  },
  disable: {
    backgroundColor: Theme.background.gray
  },
  disableText: {
    color: Theme.fontColors.black
  },
  error: {
    backgroundColor: Theme.background.red
  },
  errorText: {
    color: Theme.fontColors.white
  }
});
