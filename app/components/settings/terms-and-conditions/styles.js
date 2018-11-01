import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    padding: 24,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  containerContent: {
    paddingBottom: 20
  },
  content: {
    paddingTop: 0,
    paddingBottom: 30
  },
  termsText: {
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '100',
    marginTop: 0,
    ...Platform.select({
      ios: {
        color: Theme.fontColors.light
      }
    }),
    textAlignVertical: 'bottom',
    lineHeight: 32
  },
  termsTextLinkContainer: {
    paddingLeft: 4,
    paddingTop: 4
  },
  termsTextLink: {
    marginTop: 0
  }
});
