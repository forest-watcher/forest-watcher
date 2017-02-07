import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    left: 8,
    right: 8,
    borderRadius: 100,
    backgroundColor: Theme.colors.color1
  },
  button: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    flex: 1,
    marginLeft: Theme.icon.width,
    textAlign: 'center',
    color: Theme.fontColors.white,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500'
  }
});
