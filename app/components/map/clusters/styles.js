import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start'
  },
  bubble: {
    backgroundColor: Theme.colors.color1,
    padding: 2,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 50,
    borderColor: Theme.colors.color1,
    borderWidth: 0.5
  },
  number: {
    color: '#FFFFFF',
    fontSize: 13
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: Theme.colors.color1,
    alignSelf: 'center',
    marginTop: -9
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: Theme.colors.color1,
    alignSelf: 'center',
    marginTop: -0.5
  }
});
