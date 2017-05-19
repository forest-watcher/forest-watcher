import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  datesSection: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dateContainerLabel: {
    width: 120,
    height: 22
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'column'
  },
  dateLabel: {
    paddingTop: 10,
    alignItems: 'flex-end'
  },
  dateInput: {
    flex: 1,
    borderWidth: 0,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  dateText: {
    alignItems: 'center',
    justifyContent: 'center',
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 13,
    paddingLeft: 2,
    fontWeight: '800'
  },
  row: {
    height: 72,
    paddingLeft: Theme.margin.left,
    paddingRight: Theme.margin.right,
    backgroundColor: Theme.colors.color5,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
