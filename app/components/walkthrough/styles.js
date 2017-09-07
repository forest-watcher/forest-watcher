import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main,
    justifyContent: 'flex-end'
  },
  slideContainer: {
    height: Theme.screen.height,
    flex: 1,
    justifyContent: 'space-between'
  },
  textsContainer: {
    marginTop: 32,
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
    width: Theme.screen.width,
    alignItems: 'center'
  },
  phoneImage: {
    width: 259,
    height: 424,
    borderRadius: 8
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    height: 64,
    width: Theme.screen.width,
    backgroundColor: 'transparent',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1
  },
  footerHack: {
    position: 'absolute',
    bottom: 0,
    height: 64,
    width: Theme.screen.width,
    backgroundColor: Theme.background.white
  },
  skipButton: {
    color: Theme.fontColors.light,
    fontFamily: Theme.font,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    marginTop: 16,
    paddingRight: 24
  }
});
