import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  headingText: {
    flex: 1,
    fontFamily: Theme.font,
    fontSize: 17,
    fontWeight: '500',
    marginVertical: 10
  },
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  picker: {
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
    overflow: 'hidden'
  },
  actionButton: {
    marginVertical: 24
  },
  headerImage: {
    alignSelf: 'stretch',
    height: 164
  }
});
