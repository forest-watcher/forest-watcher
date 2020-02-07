import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  label: {
    ...Theme.tableRowText
  },
  smallLabel: {
    ...Theme.tableRowText,
    fontSize: 12
  },
  pickerHeader: {
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 24
  }
});
