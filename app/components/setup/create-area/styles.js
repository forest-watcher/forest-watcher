import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    paddingTop: isSmallScreen ? 22 : 38
  },
  label: {
    ...Theme.sectionHeaderText,
    lineHeight: 24,
    marginHorizontal: 16,
    marginBottom: 12
  }
});
