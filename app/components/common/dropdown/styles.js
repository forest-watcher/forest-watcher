import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  section: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  containerLabel: {
    width: 120,
    height: 22,
    overflow: 'hidden'
  },
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  pickerContainer: {
    overflow: 'hidden'
  }
});
