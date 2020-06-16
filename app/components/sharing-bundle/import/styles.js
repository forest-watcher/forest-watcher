import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  bottomTray: {
    flexDirection: 'column',
    alignSelf: 'stretch',
    alignItems: 'stretch'
  },
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 56,
    flex: 1
  },
  progressText: {
    color: Theme.fontColors.secondary,
    fontSize: 12,
    fontFamily: Theme.font,
    marginBottom: 16,
    textAlign: 'center'
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
