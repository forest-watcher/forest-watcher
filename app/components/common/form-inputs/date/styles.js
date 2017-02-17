import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

// https://github.com/xgfe/react-native-datepicker#property-customstyles-available-keys
export default StyleSheet.create({
  datePicker: {
    flex: 1,
    width: Theme.screen.width - Theme.margin.left - Theme.margin.right,
    alignItems: 'center',
    justifyContent: 'center'
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
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400'
  }
});
