import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: Platform.OS === 'ios' ? 300 : undefined,
    backgroundColor: Theme.background.main,
    borderLeftColor: Theme.borderColors.main,
    borderLeftWidth: 2
  },
  heading: {
    ...Theme.sectionHeaderText,
    marginLeft: 32,
    marginTop: 32,
    marginBottom: 40
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
  },
  rowContainer: {
    marginBottom: 18
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
