import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  contentContainer: {
    paddingTop: 12,
    flex: 1
  },
  heading: {
    ...Theme.sectionHeaderText,
    marginLeft: 24,
    marginTop: 24,
    marginBottom: 28
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
  },
  rowContainer: {
    paddingVertical: 18
  },
  row: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rowIcon: {
    height: 28,
    width: 28
  },
  rowLabel: {
    flexShrink: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12
  },
  rowSubtitleLabel: {
    flexShrink: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12,
    opacity: 0.6
  },
  rowTitleLabel: {
    flexShrink: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 16
  }
});
