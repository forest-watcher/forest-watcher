import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  backgroundHack: {
    position: 'absolute',
    top: -64,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: Theme.background.main
  },
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  label: {
    marginLeft: 16,
    fontSize: 17,
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontWeight: '400'
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 30
  },
  row: {
    marginTop: 32
  },
  iconSettings: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});
