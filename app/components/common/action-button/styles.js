import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: Theme.background.secondary,
    backgroundColor: Theme.background.secondary,
    overflow: 'hidden'
  },
  iconContainer: {
    width: Theme.icon.width,
    marginRight: 12
  },
  dark: {
    backgroundColor: Theme.colors.veryLightPinkTwo,
    borderColor: Theme.colors.veryLightPinkTwo
  },
  light: {
    backgroundColor: Theme.background.white,
    borderColor: Theme.background.white
  },
  disabled: {
    backgroundColor: Theme.colors.veryLightPinkTwo,
    borderColor: Theme.colors.veryLightPinkTwo
  },
  error: {
    backgroundColor: Theme.colors.carnation,
    borderColor: Theme.colors.carnation
  },
  secondary: {
    backgroundColor: 'transparent',
    borderColor: Theme.colors.turtleGreen
  },
  transparent: {
    backgroundColor: 'transparent'
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 24,
    paddingVertical: 12
  },
  buttonNoIcon: {
    paddingLeft: 0
  },
  short: {
    height: 48
  },
  shortIcon: {
    width: 16,
    height: 16
  },
  buttonLight: {
    justifyContent: 'flex-start'
  },
  buttonText: {
    flex: 1,
    textAlign: 'center',
    color: Theme.fontColors.white,
    fontFamily: Theme.font,
    fontSize: 15,
    fontWeight: '500',
    ...Platform.select({
      ios: {
        marginTop: 2
      }
    })
  },
  buttonTextLeft: {
    textAlign: 'left'
  },
  buttonTextMain: {
    textAlign: 'center',
    fontStyle: 'normal',
    fontSize: 16
  },
  buttonTextMonochrome: {
    fontStyle: 'normal',
    fontSize: 16,
    color: Theme.fontColors.main
  },
  buttonTextLight: {
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400'
  },
  buttonTextDisabled: {
    color: Theme.fontColors.light,
    marginLeft: 0
  },
  buttonTextError: {
    color: Theme.fontColors.white,
    fontWeight: '400',
    marginLeft: 0,
    fontStyle: 'normal',
    fontSize: 16
  },
  buttonTextSecondary: {
    color: Theme.fontColors.main
  }
});
