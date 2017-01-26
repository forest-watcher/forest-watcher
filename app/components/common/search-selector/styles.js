import config from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  searchBox: {
    height: 64,
    backgroundColor: config.colors.color5,
    borderColor: config.colors.color6,
    borderWidth: 1,
    justifyContent: 'center'
  },
  searchText: {
    fontFamily: config.font,
    color: config.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 24
  },
  modal: {
    flex: 1,
    backgroundColor: config.background.main
  },
  search: {
    paddingTop: 44,
    height: 88,
    backgroundColor: config.colors.color5,
    borderBottomWidth: 1,
    borderBottomColor: config.colors.color6
  },
  searchInput: {
    height: 24,
    paddingLeft: 24,
    fontFamily: config.font,
    fontSize: 17,
    fontWeight: '400',
    color: config.fontColors.secondary
  },
  list: {
    flex: 1
  },
  listContent: {
    padding: 24
  },
  listItem: {
    fontFamily: config.font,
    color: config.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 20
  }
});
