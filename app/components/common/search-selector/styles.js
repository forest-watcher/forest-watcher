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
    paddingTop: 44,
    height: 88,
    backgroundColor: Theme.colors.color5,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.color6,
    position: 'relative'
  },
  closeIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8
  },
  searchInput: {
    height: 24,
    paddingBottom: 0,
    marginLeft: 24,
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
    padding: 24
  },
  listItem: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 20
  }
});
