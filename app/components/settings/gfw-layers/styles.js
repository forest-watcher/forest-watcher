import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 12,
    flex: 1
  }
});
