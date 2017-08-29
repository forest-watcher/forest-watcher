import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingTop: 10
  },
  containerContent: {
    paddingBottom: 20
  },
  content: {
    paddingTop: 0,
    paddingBottom: 30
  },
  terms: {
    padding: 30,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  termsList: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  termsListNoPadding: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  termsText: {
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '100',
    color: Theme.fontColors.light,
    marginTop: 10
  },
  termsTextNone: {
    display: 'none'
  }
});
