import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  loader: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
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
