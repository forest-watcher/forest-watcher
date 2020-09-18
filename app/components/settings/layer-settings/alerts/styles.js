import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  inactiveHeading: {
    opacity: 0.6
  },
  heading: {
    ...Theme.sectionHeaderText,
    marginLeft: 24,
    marginTop: 24,
    marginBottom: 12
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
  },
  selectRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  },
  bodyText: {
    ...Theme.text,
    fontSize: 12,
    opacity: 0.6
  },
  smallLabel: {
    ...Theme.text,
    fontSize: 12
  }
});
