import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: Theme.background.main,
    flex: 1
  },
  intro: {
    alignItems: 'center',
    paddingVertical: 26
  },
  bottomContainer: {
    justifyContent: 'center',
    flexGrow: 1
  },
  buttonsLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.secondary,
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'center'
  },
  button: {
    height: 56,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 32,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 22
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttonTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconArrow: {
    width: 10,
    height: 18
  },
  buttonEmail: {
    backgroundColor: Theme.colors.turtleGreen
  },
  iconEmail: {
    width: 23,
    height: 21
  },
  buttonFacebook: {
    backgroundColor: Theme.socialNetworks.facebook
  },
  iconFacebook: {
    width: 23,
    height: 21
  },
  buttonTwitter: {
    backgroundColor: Theme.socialNetworks.twitter
  },
  iconTwitter: {
    width: 23,
    height: 20
  },
  buttonGoogle: {
    backgroundColor: Theme.socialNetworks.google
  },
  iconGoogle: {
    width: 23,
    height: 21
  },
  buttonCountry: {
    backgroundColor: Theme.colors.grey,
    height: 48
  },
  buttonText: {
    letterSpacing: 0.8,
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 16,
    marginLeft: 18
  },
  buttonTextCountry: {
    marginLeft: 24
  },
  signInContainer: {
    flexGrow: 1
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'stretch',
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: Theme.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.veryLightPinkTwo,
    ...Platform.select({
      ios: {
        zIndex: 1
      },
      android: {
        height: 44
      }
    })
  },
  webViewButtonClose: {
    justifyContent: 'center',
    paddingRight: 10,
    alignItems: 'center',
    ...Platform.select({
      android: {
        // todo: check how this behaves on Android, now absolute positioning has been purged.
        top: 4
      }
    })
  },
  webViewButtonCloseText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 22,
    fontWeight: '600'
  },
  webViewUrl: {
    height: 32,
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    backgroundColor: Theme.colors.veryLightPink,
    fontSize: 15,
    fontWeight: '400',
    flex: 1,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 8,
    marginRight: 10,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        top: 6
      }
    })
  },
  versionText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8
  },
  loaderContainer: {
    backgroundColor: 'transparent',
    left: 0,
    right: 0,
    bottom: 0,
    position: 'absolute',
    zIndex: 5
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'flex-start'
  }
});
