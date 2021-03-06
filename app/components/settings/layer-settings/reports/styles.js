import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
  },
  rowContainer: {
    marginBottom: 12
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
