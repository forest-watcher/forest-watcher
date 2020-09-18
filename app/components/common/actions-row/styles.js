import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  content: {
    flex: 1,
    padding: 16
  },
  image: {
    aspectRatio: 1
  },
  row: {
    ...Theme.tableRow,
    alignItems: 'stretch',
    paddingVertical: 0,
    paddingLeft: 0
  },
  topIcon: {
    alignSelf: 'flex-start'
  }
});
