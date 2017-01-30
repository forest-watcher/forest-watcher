import Theme from 'config/theme';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background.main
  },
  intro: {
    flex: .5,
    alignItems: 'center'
  },
  introLabel: {
    marginTop: 230,
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 15,
    fontWeight: '500'
  },
  buttons: {
    flex: .5
  },
  buttonsLabel: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: Theme.margin.left
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
  buttonFacebook: {
    backgroundColor: Theme.socialNetworks.facebook
  },
  buttonTwitter: {
    backgroundColor: Theme.socialNetworks.twitter
  },
  buttonGoogle: {
    backgroundColor: Theme.socialNetworks.google
  },
  buttonText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.white,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 56
  },
  modal: {
    flex: 1,
  },
  webViewHeader: {
    height: 64,
    left: 0,
    right: 0,
    backgroundColor: Theme.background.white,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.color6,
    position: 'absolute',
    zIndex: 1
  },
  webViewButtonClose: {
    width: 38,
    top: 21,
    justifyContent: 'center',
    alignItems: 'center'
  },
  webViewButtonCloseText: {
    fontFamily: Theme.font,
    color: Theme.fontColors.main,
    fontSize: 22,
    fontWeight: '600',
  },
  webViewUrl: {
    fontFamily: Theme.font,
    color: Theme.fontColors.light,
    backgroundColor: Theme.colors.color4,
    fontSize: 15,
    fontWeight: '400',
    top: 24,
    height: 32,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 10,
    paddingRight: 10,
    position: 'absolute',
    left: 40,
    right: 40,
  },
  webView: {
    position: 'relative',
    marginTop: 64
  }
});
