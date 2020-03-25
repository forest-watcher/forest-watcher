import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  contentContainer: {
    flex: 1,
    width: Theme.screen.width,
    height: Theme.screen.height
  },
  label: {
    ...Theme.sectionHeaderText
  },
  list: {
    flex: 1,
    paddingTop: isSmallScreen ? 28 : 76
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 72
  },
  row: {
    position: 'absolute',
    width: Theme.screen.width,
    backgroundColor: Theme.background.white,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 16
  },
  tableRowContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tableRowText: {
    marginLeft: 24,
    ...Theme.tableRowText
  },
  iconSettings: {
    position: 'absolute',
    top: 0,
    right: 0
  }
});
