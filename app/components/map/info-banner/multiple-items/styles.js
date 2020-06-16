import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  contentContainer: {
    paddingTop: 44
  },
  listContainer: {
    flex: 1,
    marginBottom: 24
  },
  listTitle: {
    ...Theme.sectionHeaderText
  },
  itemTitle: {
    ...Theme.tableRowText,
    fontSize: 16
  },
  itemText: {
    ...Theme.tableRowText,
    paddingTop: 4,
    fontSize: 12
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
