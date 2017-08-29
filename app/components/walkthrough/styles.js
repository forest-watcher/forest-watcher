import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  footer: {
    flexDirection: 'row',
    height: 64,
    width: Theme.screen.width,
    backgroundColor: Theme.background.white,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textsContainer: {
    marginTop: 42,
    paddingHorizontal: 24
  },
  title: {
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 21,
    fontWeight: '400',
    textAlign: 'center'
  },
  subtitle: {
    color: Theme.fontColors.main,
    fontFamily: Theme.font,
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center'
  },
  phoneContainer: {
    position: 'absolute',
    bottom: 0,
    width: Theme.screen.width,
    alignItems: 'center'

  },
  phoneImage: {
    width: 259,
    height: 424,
    borderRadius: 8
  }
});
