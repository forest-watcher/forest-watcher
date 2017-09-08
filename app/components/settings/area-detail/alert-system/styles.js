import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  container: {
    flex: 1
  },
  alertSystemText: {
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  loader: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
