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
    ...Theme.sectionHeaderText,
    marginBottom: 12,
    marginLeft: 22,
    marginTop: 28,
    fontSize: 16
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingBottom: 30
  },
  tableRowContent: {
    paddingHorizontal: 8,
    flex: 1,
    width: '100%'
  },
  tableRowText: {
    fontSize: 12,
    lineHeight: 20,
    color: Theme.colors.greyishBrown,
    fontFamily: Theme.font
  },
  error: {
    fontFamily: Theme.font,
    color: Theme.colors.grey,
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    padding: 20
  },
  row: {
    ...Theme.tableRow,
    marginBottom: 6,
    marginTop: 28,
    width: '100%',
    flex: 1,
    paddingHorizontal: 24
  },
  onholdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1
  },
  onHoldText: {
    fontSize: 16,
    fontWeight: '400',
    color: Theme.colors.greyishBrown,
    fontFamily: Theme.font
  }
});
