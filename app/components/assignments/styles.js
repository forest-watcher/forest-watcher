import Theme, { isSmallScreen } from 'config/theme';
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
    ...Theme.sectionHeaderText,
    marginBottom: 12,
    lineHeight: 24
  },
  list: {
    flex: 0,
    backgroundColor: Theme.background.main
  },
  listContent: {
    paddingTop: isSmallScreen ? 22 : 38,
    paddingBottom: 30
  },
  tableRowContent: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 20
  },
  tableRowText: {
    ...Theme.text,
    fontSize: 14,
    lineHeight: 18
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
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
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
  routeContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowContainer: {
    marginBottom: 25
  },
  row: {
    ...Theme.tableRow,
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: 'center',
    marginBottom: 16
  }
});
