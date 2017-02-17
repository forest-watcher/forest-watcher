import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  content: {
    flexDirection: 'row'
  },
  item: {
    width: 128,
    height: 184,
    backgroundColor: '#FFFFFF',
    borderBottomColor: Theme.borderColors.main,
    borderBottomWidth: 2,
    margin: 7,
    overflow: 'hidden'
  },
  image: {
    width: 128,
    height: 128
  },
  name: {
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.main
  }
});
