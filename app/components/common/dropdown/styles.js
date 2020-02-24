import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  doneButtonContainer: {
    marginLeft: 16
  },
  doneLabel: {
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 16,
    fontWeight: '500'
  },
  label: {
    ...Theme.tableRowText
  },
  smallLabel: {
    ...Theme.tableRowText,
    fontSize: 12
  },
  switch: {
    alignItems: 'center',
    borderColor: Theme.colors.veryLightPinkTwo,
    borderRadius: 14,
    borderWidth: 2,
    height: 28,
    justifyContent: 'space-around',
    marginRight: 6,
    width: 28
  },
  switchInterior: {
    backgroundColor: Theme.colors.turtleGreen,
    borderRadius: 9,
    height: 18,
    width: 18
  },
  switchOn: {
    borderColor: Theme.colors.turtleGreen
  },
  optionRow: {
    marginBottom: 0
  },
  optionRowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pickerHeader: {
    alignItems: 'center',
    borderBottomColor: Theme.colors.veryLightPinkTwo,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 24
  }
});
