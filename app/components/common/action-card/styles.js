import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderColor: Theme.colors.color1,
    borderWidth: 2,
    borderStyle: 'dashed'
  },
  text: {
    color: Theme.fontColors.main
  }
});
