import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  rowSubtitleLabel: {
    ...Theme.tableRowText,
    flex: 1,
    fontSize: 12
  },
  rowTitleLabel: {
    ...Theme.tableRowText,
    flex: 1,
    fontSize: 16
  },
  rowIcon: {
    marginRight: 24
  }
});
