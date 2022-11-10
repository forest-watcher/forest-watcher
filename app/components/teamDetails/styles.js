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
    marginLeft: 22
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: isSmallScreen ? 22 : 38,
    paddingBottom: 30
  },
  tableRowContent: {
    paddingHorizontal: 8
  },
  tableRowText: {
    fontSize: 14,
    lineHeight: 20
  },
  error: {
    fontFamily: Theme.font,
    color: Theme.colors.grey,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    padding: 20
  }
});
