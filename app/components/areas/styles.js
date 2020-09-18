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
    marginBottom: 8
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: isSmallScreen ? 22 : 38,
    paddingBottom: 30
  }
});
