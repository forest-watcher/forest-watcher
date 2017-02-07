import Theme from 'config/theme';
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
  content: {
    marginTop: 26,
    marginLeft: Theme.margin.left
  },
  text: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400'
  },
  selector: {
    marginTop: 19
  },
  selectorLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: Theme.margin.left,
    ...Platform.select({
      android: {
        marginBottom: 6
      }
    })
  },
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
  },
  buttonPos: {
    position: 'absolute',
    bottom: 50,
    left: 8,
    right: 8
  }
});
