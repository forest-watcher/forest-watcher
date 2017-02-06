import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  button: {
    height: 64,
    position: 'absolute',
    bottom: 50,
    left: 8,
    right: 8,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.color1
  },
  buttonText: {
    color: Theme.fontColors.white,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500'
  }
});
