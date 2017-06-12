import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
  },
  bubble: {
    backgroundColor: Theme.colors.color8,
    borderRadius: 100,
    width: 40,
    height: 40,
    alignItems: 'center'
  },
  number: {
    color: Theme.colors.color5,
    fontSize: 13,
    marginTop: 10
  }
});
