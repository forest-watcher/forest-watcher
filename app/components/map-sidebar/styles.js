import Theme from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  basemapContainer: {
    alignItems: 'flex-start',
    justifyContent: Platform.OS === 'android' ? 'flex-end' : 'flex-start',
    backgroundColor: Theme.colors.white,
    paddingLeft: 24,
    paddingTop: 6,
    paddingBottom: 6
  },
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
    marginBottom: 12
  }
});
