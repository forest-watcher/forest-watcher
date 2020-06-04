import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  row: {
    marginBottom: 0
  },
  rowContent: {
    flexDirection: 'row',
    flex: 1
  },
  rowCheckbox: {
    width: 30,
    height: 30,
    marginTop: 7
  },
  rowDescription: {
    flex: 1,
    lineHeight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    ...Theme.tableRowText,
    color: Theme.fontColors.secondary,
    fontSize: 12
  },
  rowIcon: {
    width: 48,
    height: 48
  },
  rowTextWrapper: {
    paddingHorizontal: 20,
    flex: 1
  },
  rowTitle: {
    flex: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 16,
    fontWeight: '400'
  }
});
