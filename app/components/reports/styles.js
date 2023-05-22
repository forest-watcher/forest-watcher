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
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerCenter: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerFloat: {
    marginTop: 56
  },
  containerFull: {
    marginTop: 0
  },
  contentContainer: {
    paddingTop: 44
  },
  listContainer: {
    flex: 1,
    marginBottom: 24
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
    ...Theme.sectionHeaderText
  },
  emptyTitle: {
    flex: 1,
    fontSize: 17,
    marginTop: 48,
    marginLeft: Theme.margin.left,
    marginRight: Theme.margin.left,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  },
  exportButton: {
    justifyContent: 'center',
    paddingVertical: 10
  },
  exportButtonContainer: {
    backgroundColor: 'white',
    borderTopWidth: 5
  },
  exportTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    paddingVertical: 20,
    color: Theme.fontColors.light,
    alignSelf: 'center',
    alignContent: 'center'
  },
  listItem: {
    maxWidth: 288
  },
  itemTitle: {
    ...Theme.tableRowText,
    fontSize: 16
  },
  itemText: {
    ...Theme.tableRowText,
    fontSize: 12
  },
  topBarTextButton: {
    fontSize: 16,
    fontFamily: Theme.font,
    color: Theme.colors.turtleGreen,
    backgroundColor: Theme.background.main
  }
});
