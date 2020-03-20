import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

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
  faq: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  faqList: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  faqListLetter: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  faqListLetterDescription: {
    flex: 1,
    paddingLeft: 30,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  faqListNoPadding: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  faqDotList: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: Theme.fontColors.light,
    top: 17,
    marginRight: 10
  },
  faqText: {
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '100',
    marginTop: 10,
    ...Platform.select({
      ios: {
        color: Theme.fontColors.light
      }
    })
  },
  faqTitle: {
    ...Theme.text,
    fontSize: 24
  },
  faqTextNone: {
    display: 'none'
  }
});
