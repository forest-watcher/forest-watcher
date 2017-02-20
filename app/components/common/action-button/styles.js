import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    borderRadius: 32,
    backgroundColor: Theme.background.secondary
  },
  light: {
    backgroundColor: Theme.background.white
  },
  disabled: {
    backgroundColor: Theme.colors.color6
  },
  button: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonLight: {
    justifyContent: 'flex-start'
  },
  buttonText: {
    flex: 1,
    marginLeft: Theme.icon.width,
    textAlign: 'center',
    color: Theme.fontColors.white,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500'
  },
  buttonTextLight: {
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    textAlign: 'left',
    marginLeft: Theme.margin.left
  }
});
