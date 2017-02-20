import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    height: 104,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 21,
    fontWeight: '400'
  },
  margin: {
    marginLeft: 16
  }
});
