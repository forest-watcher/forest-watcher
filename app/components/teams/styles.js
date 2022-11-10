import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  containerEmpty: {
    flex: 1,
    backgroundColor: Theme.background.main,
    justifyContent: 'space-around'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    ...Theme.sectionHeaderText,
    marginBottom: 12,
    lineHeight: 28
  },
  list: {
    flex: 0,
    backgroundColor: Theme.background.main
  },
  listContent: {
    paddingTop: isSmallScreen ? 22 : 38,
    paddingBottom: 30
  },
  tableRowContent: {
    paddingVertical: 14
  },
  tableRowText: {
    ...Theme.text,
    fontSize: 14,
    lineHeight: 18
  }
});
