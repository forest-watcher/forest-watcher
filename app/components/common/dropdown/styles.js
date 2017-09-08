import { StyleSheet } from 'react-native';
import Theme from 'config/theme';

export default StyleSheet.create({
  section: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  containerLabel: {
    width: 120,
    overflow: 'hidden',
    justifyContent: 'center',
    fontSize: 17,
    fontWeight: '400',
    fontFamily: Theme.font,
    color: Theme.fontColors.light
  },
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  pickerContainer: {
    overflow: 'hidden'
  },
  pickerItem: {
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '400',
    color: Theme.fontColors.light
  }
});
