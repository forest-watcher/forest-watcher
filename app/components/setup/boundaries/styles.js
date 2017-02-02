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
  title: {
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 21,
    fontWeight: '400',
    marginTop: 45,
    marginLeft: Theme.margin.left
  },
  content: {
    marginTop: 26,
    marginLeft: Theme.margin.left
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
  actions: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  button: {
    width: (Theme.screen.width / 2) - 12,
    height: 184,
    marginLeft: 8,
    marginBottom: 8,
    backgroundColor: Theme.background.white,
    borderWidth: 1,
    borderColor: Theme.colors.color6,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  buttonTextContainer: {
    width: 116,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  buttonText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 21,
    textAlign: 'center'
  }
});
