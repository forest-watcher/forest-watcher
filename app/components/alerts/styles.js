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
  area: {
    padding: 10,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  areaTitle: {
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary,
    marginLeft: 13
  },
  areaMore: {
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    color: Theme.fontColors.main,
    marginRight: 6
  },
  list: {
    padding: 15,
    paddingTop: 0,
    flexDirection: 'row'
  },
  alerts: {
    flexDirection: 'row',
    paddingRight: 15
  }
});
