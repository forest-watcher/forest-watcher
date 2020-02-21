import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  datasetSection: {
    flex: 1
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
    backgroundColor: Theme.colors.white,
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  legendContainer: {
    width: '100%',
    backgroundColor: Theme.colors.white,
    flexDirection: 'row',
    paddingBottom: 8
  },
  legendItem: {
    marginRight: 24
  },
  nested: {
    backgroundColor: Theme.colors.veryLightPink
  }
});
