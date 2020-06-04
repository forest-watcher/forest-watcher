import Theme, { isSmallScreen } from 'config/theme';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 56,
    flex: 1
  },
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
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
