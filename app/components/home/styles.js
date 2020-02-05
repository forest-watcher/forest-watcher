import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.background.main,
    flexDirection: 'column'
  },
  center: {
    justifyContent: 'space-around'
  },
  button: {
    marginLeft: 8,
    marginRight: 8
  }
});
