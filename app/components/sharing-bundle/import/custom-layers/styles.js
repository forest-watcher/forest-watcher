import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 56,
    flex: 1
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
