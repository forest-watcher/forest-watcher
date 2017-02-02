import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  searchBox: {
    height: 64,
    backgroundColor: Theme.colors.color5,
    borderColor: Theme.colors.color6,
    borderWidth: 1,
    justifyContent: 'center'
  },
  searchText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 24
  },
  modal: {
    flex: 1,
    position: 'relative',
    backgroundColor: Theme.background.main
  },
  modalClose: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 150,
    right: 8
  },
  search: {
    paddingTop: 44,
    height: 88,
    backgroundColor: Theme.colors.color5,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.color6
  },
  searchInput: {
    height: 24,
    paddingLeft: 24,
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
