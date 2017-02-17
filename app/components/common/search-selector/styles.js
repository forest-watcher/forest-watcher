import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  searchContainer: {
    height: 64,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    backgroundColor: Theme.colors.color5,
    borderColor: Theme.colors.color6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  searchText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  modal: {
    flex: 1,
    position: 'relative',
    backgroundColor: Theme.background.main
  },
  search: {
    paddingTop: 8,
    height: 88,
    backgroundColor: Theme.colors.color5,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    position: 'relative'
  },
  closeIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8
  },
  searchInput: {
    height: 88,
    paddingBottom: 32,
    paddingTop: 32,
    paddingLeft: 24,
    marginRight: 48,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.secondary
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 10
  },
  listItem: {
    paddingLeft: 24,
    paddingTop: 10,
    paddingBottom: 10
  },
  listItemText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400'
  }
});
