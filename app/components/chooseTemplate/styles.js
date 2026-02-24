import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingVertical: isSmallScreen ? 22 : 30
  },
  label: {
    ...Theme.sectionHeaderText,
    marginBottom: 12,
    marginHorizontal: 16,
    lineHeight: 24
  },
  row: {
    paddingLeft: 0,
    marginLeft: -8
  },
  listContent: {
    paddingBottom: 30
  }
});
