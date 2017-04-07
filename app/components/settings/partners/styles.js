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
  partner: {
    padding: 10,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  partnerTitle: {
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary,
    marginLeft: 13
  },
  partnerMore: {
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    color: Theme.fontColors.main,
    marginRight: 6
  }
});
