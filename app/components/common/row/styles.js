import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  row: {
    ...Theme.tableRow
  },
  topIcon: {
    alignSelf: 'flex-start'
  }
});
