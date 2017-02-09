import Theme from 'config/theme';
import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  intro: {
    flex: 0.4,
    alignItems: 'center'
  },
  logo: {
    width: 108,
    height: 112,
    marginTop: 60
  },
  introLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 15,
    fontWeight: '500',
    marginTop: 20
  },
  buttons: {
    flex: 0.6,
    marginTop: 70
  },
  buttonsLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: Theme.margin.left,
    ...Platform.select({
      android: {
        marginBottom: 8
      }
    })
  },
  button: {
    height: 64,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 100,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  iconArrow: {
    width: 10,
    height: 18,
    position: 'absolute',
    right: 24,
    top: 2
  },
  buttonFacebook: {
    backgroundColor: Theme.socialNetworks.facebook
  },
  iconFacebook: {
    width: 12,
    height: 21,
    position: 'absolute',
    left: 24,
    top: 2
  },
  buttonTwitter: {
    backgroundColor: Theme.socialNetworks.twitter
  },
  iconTwitter: {
    width: 23,
    height: 20,
    position: 'absolute',
    left: 20,
    top: 4
  },
  buttonGoogle: {
    backgroundColor: Theme.socialNetworks.google
  },
  iconGoogle: {
    width: 21,
    height: 21,
    position: 'absolute',
    left: 20,
    top: 3
  },
  buttonText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 56
  },
  modal: {
    flex: 1
  },
  webViewHeader: {
    left: 0,
    right: 0,
    backgroundColor: Theme.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.color6,
    ...Platform.select({
      ios: {
        height: 64,
        zIndex: 1,
        position: 'absolute'
      },
      android: {
        height: 44
      }
    })
  },
  webViewButtonClose: {
    width: 34,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    ...Platform.select({
      ios: {
        top: 21
      },
      android: {
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
    backgroundColor: Theme.colors.color4,
    fontSize: 15,
    fontWeight: '400',
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 32,
    marginRight: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        top: 24
      },
      android: {
        top: 6
      }
    })
  },
  webView: {
    position: 'relative',
    ...Platform.select({
      ios: {
        marginTop: 64
      }
    })
  }
});
