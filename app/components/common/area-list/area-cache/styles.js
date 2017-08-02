import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontStyle: 'italic'
  }
});
