import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    justifyContent: 'space-between'
  },
  arrowText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontFamily: Theme.font,
    fontSize: 21,
    fontWeight: '400',
    marginLeft: 8
  },
  margin: {
    marginLeft: 16
  },
  logout: {
    height: 24,
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 16,
    fontWeight: '400',
    marginTop: 2,
    marginRight: 10
  },
  rightButton: {
    marginRight: 16
  }
});
