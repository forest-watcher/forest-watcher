import Theme, { isSmallScreen } from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  },
  listHeader: {
    flex: 1,
    marginLeft: Theme.margin.left,
    marginRight: 18,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 0
  },
  rowLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12
  },
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: isSmallScreen ? 16 : 17,
    fontWeight: '400',
    marginBottom: 4
  }
});
