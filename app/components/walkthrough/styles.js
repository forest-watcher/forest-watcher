import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    width: Theme.screen.width,
    height: Theme.screen.height,
    backgroundColor: Theme.background.main,
    position: 'relative'
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topSection: {
    maxHeight: 140,
    marginBottom: 40
  },
  textsContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
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
    flex: 1,
    width: Theme.screen.width,
    alignItems: 'center',
    justifyContent: 'center'
  },
  phoneImage: {
    width: '100%',
    height: '100%',
    maxWidth: Theme.screen.width > 300 ? 250 : 270,
    maxHeight: 400,
    borderRadius: 8,
    marginTop: 80,
    marginBottom: 102
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
    ...Platform.select({
      android: {
        marginTop: 16
      },
      ios: {
        marginTop: 24
      }
    }),
    paddingRight: 24
  },
  icon: {
    marginLeft: 12,
    marginRight: 12
  }
});
