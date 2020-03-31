import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
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
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  },
  rowContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 0
  },
  rowLabel: {
    flexShrink: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12
  }
});
