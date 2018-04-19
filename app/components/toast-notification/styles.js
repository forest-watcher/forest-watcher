import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  view: {
    ...Platform.select({
      android: {
        paddingTop: 16
      },
      ios: {
        paddingTop: 32
      }
    }),
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 16,
    backgroundColor: Theme.background.white,
    flexDirection: 'column',
    width: Theme.screen.width,
    shadowColor: Theme.colors.color2,
    shadowRadius: 5,
    shadowOffset: { height: 2 },
    shadowOpacity: 0.4
  },
  text: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  success: {
    backgroundColor: Theme.background.secondary
  },
  successText: {
    color: Theme.fontColors.white
  }
});
