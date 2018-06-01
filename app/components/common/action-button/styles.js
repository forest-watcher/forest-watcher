import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    borderRadius: 32,
    backgroundColor: Theme.background.secondary,
    overflow: 'hidden'
  },
  iconContainer: {
    width: Theme.icon.width,
    marginRight: 12
  },
  light: {
    backgroundColor: Theme.background.white
  },
  disabled: {
    backgroundColor: Theme.colors.color6
  },
  error: {
    backgroundColor: Theme.colors.color7
  },
  button: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8
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
    marginLeft: 8,
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
    fontWeight: '400',
    marginLeft: 0,
    fontStyle: 'italic'
  },
  buttonTextError: {
    color: Theme.fontColors.white,
    fontWeight: '400',
    marginLeft: 0,
    fontStyle: 'normal',
    fontSize: 16
  }
});
