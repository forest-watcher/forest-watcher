import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  containerEmpty: {
    flex: 1,
    backgroundColor: Theme.background.main,
    justifyContent: 'space-around'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    ...Theme.sectionHeaderText
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingTop: 10,
    paddingBottom: 30
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
    justifyContent: 'space-between'
  },
  rowLabel: {
    flexShrink: 1,
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 12
  }
});
