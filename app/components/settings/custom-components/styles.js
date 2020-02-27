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
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 56,
    paddingBottom: 30
  },
  label: {
    ...Theme.sectionHeaderText
  },
  user: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  row: {
    paddingVertical: 40
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  rowIcon: {
    marginRight: 26
  },
  rowLabel: {
    ...Theme.tableRowText,
    flex: 1
  },
  rowSublabel: {
    ...Theme.tableRowText,
    fontSize: 12,
    flex: 1
  }
});
