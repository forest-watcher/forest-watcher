import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  label: {
    ...Theme.sectionHeaderText
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 30,
    paddingBottom: 30
  },
  rowTitleLabel: {
    ...Theme.tableRowText,
    flex: 1,
    fontSize: 16
  }
});
