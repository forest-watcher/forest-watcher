import config from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontFamily: config.font,
    color: config.fontColors.main,
    fontSize: 21,
    fontWeight: '400',
    marginTop: 45,
    marginLeft: 24
  },
  content: {
    marginTop: 26,
    marginLeft: 24
  },
  text: {
    fontFamily: config.font,
    color: config.fontColors.secondary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400'
  },
  selector: {
    marginTop: 19
  },
  selectorLabel: {
    fontFamily: config.font,
    color: config.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 24,
    ...Platform.select({
      android: {
        marginBottom: 6
      }
    })
  },
  button: {
    height: 64,
    position: 'absolute',
    bottom: 40,
    left: 8,
    right: 8,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: config.colors.color1
  },
  buttonText: {
    color: config.fontColors.white,
    fontFamily: config.font,
    fontSize: 15,
    fontWeight: '500'
  }
});
