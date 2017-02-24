import React, { Component } from 'react';
import {
  View,
  Text,
  WebView,
  Modal,
  TouchableHighlight,
  ScrollView,
  Image
} from 'react-native';

import Config from 'react-native-config';
import Theme from 'config/theme';
import { getToken, setToken } from 'helpers/user';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';

import styles from './styles';

const logoIcon = require('assets/logo.png');
const facebookIcon = require('assets/facebook_white.png');
const twitterIcon = require('assets/twitter_white.png');
const googleIcon = require('assets/google_white.png');
const nextIcon = require('assets/next_white.png');

class Login extends Component {
  constructor() {
    super();

    this.state = {
      webviewVisible: false,
      webViewUrl: '',
      webViewCurrenUrl: '',
      webViewStatus: null
    };
    this.successTimer = null;
    this.onLoadEnd = this.onLoadEnd.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
  }

  componentDidMount() {
    tracker.trackScreenView('Login');
  }

  componentWillUnmount() {
    clearTimeout(this.successTimer);
  }

  async onLoadEnd() {
    if (this.state.webViewCurrenUrl.indexOf(Config.API_CALLBACK_URL) !== -1) {
      const token = this.state.webViewCurrenUrl.match(/token[=](.*)/);

      if (token && token[1]) {
        const saved = await setToken(token[1]);
        if (saved) {
          const userToken = await getToken();
          this.props.setLoginStatus({
            loggedIn: true,
            token: userToken
          });
          this.successTimer = this.getSuccessTimer();
        }
      } else {
        console.warn('Login incorrect');
      }
    }
  }

  onPress(socialNetwork) {
    const url = `${Config.API_URL}/auth/${socialNetwork}?token=true&callbackUrl=${Config.API_CALLBACK_URL}`;

    this.setState({
      webviewVisible: true,
      webViewUrl: url
    });
  }

  async onPressCountry(country) {
    let tokenCountry = null;
    switch (country) {
      case 'brazil':
        tokenCountry = Config.BRAZIL_TOKEN;
        break;
      case 'colombia':
        tokenCountry = Config.COLOMBIA_TOKEN;
        break;
      case 'indonesia':
        tokenCountry = Config.INDONESIA_TOKEN;
        break;
      default:
        tokenCountry = null;
    }

    if (tokenCountry) {
      const saved = await setToken(tokenCountry);
      if (saved) {
        this.props.setLoginStatus({
          loggedIn: true,
          token: tokenCountry
        });
      }
      this.props.setLoginModal(false);
    }
  }

  onNavigationStateChange(navState) {
    this.setState({
      webViewCurrenUrl: navState.url,
      webViewStatus: navState.title
    });
  }

  getSuccessTimer() {
    return setTimeout(() => {
      this.props.setLoginModal(false);
    }, 1000);
  }

  closeWebview() {
    this.setState({
      webviewVisible: false
    });
  }

  render() {
    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.props.loginModal}
        onRequestClose={() => this.props.setLoginModal(false)}
      >
        {this.state.webviewVisible
          ? <View style={styles.modal}>
            <View style={styles.webViewHeader}>
              <TouchableHighlight
                style={styles.webViewButtonClose}
                onPress={() => this.closeWebview()}
                activeOpacity={0.8}
                underlayColor={'transparent'}
              >
                <Text style={styles.webViewButtonCloseText}>x</Text>
              </TouchableHighlight>
              <Text
                style={styles.webViewUrl}
                ellipsizeMode={'tail'}
                numberOfLines={1}
              >
                {this.state.webViewCurrenUrl}
              </Text>
            </View>

            <WebView
              ref={(webView) => { this.webView = webView; }}
              automaticallyAdjustContentInsets={false}
              style={styles.webView}
              source={{ uri: this.state.webViewUrl }}
              javaScriptEnabled
              domStorageEnabled
              decelerationRate={'normal'}
              onLoadEnd={this.onLoadEnd}
              onNavigationStateChange={this.onNavigationStateChange}
              startInLoadingState
              scalesPageToFit
            />
          </View>
          : <ScrollView style={styles.container}>
            <View style={styles.intro}>
              <Image
                style={styles.logo}
                source={logoIcon}
              />
              <Text style={styles.introLabel}>{I18n.t('commonText.appName').toUpperCase()}</Text>
            </View>
            <View style={styles.buttons}>
              <Text style={styles.buttonsLabel}>{I18n.t('login.introductionText')}</Text>
              <TouchableHighlight
                style={[styles.button, styles.buttonFacebook]}
                onPress={() => this.onPress('facebook')}
                activeOpacity={0.8}
                underlayColor={Theme.socialNetworks.facebook}
              >
                <View>
                  <Image
                    style={styles.iconFacebook}
                    source={facebookIcon}
                  />
                  <Text style={styles.buttonText}>{I18n.t('login.facebookTitle')}</Text>
                  <Image
                    style={styles.iconArrow}
                    source={nextIcon}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonTwitter]}
                onPress={() => this.onPress('twitter')}
                activeOpacity={0.8}
                underlayColor={Theme.socialNetworks.twitter}
              >
                <View>
                  <Image
                    style={styles.iconTwitter}
                    source={twitterIcon}
                  />
                  <Text style={styles.buttonText}>{I18n.t('login.twitterTitle')}</Text>
                  <Image
                    style={styles.iconArrow}
                    source={nextIcon}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonGoogle]}
                onPress={() => this.onPress('google')}
                activeOpacity={0.8}
                underlayColor={Theme.socialNetworks.google}
              >
                <View>
                  <Image
                    style={styles.iconGoogle}
                    source={googleIcon}
                  />
                  <Text style={styles.buttonText}>{I18n.t('login.googleTitle')}</Text>
                  <Image
                    style={styles.iconArrow}
                    source={nextIcon}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonCountry]}
                onPress={() => this.onPressCountry('brazil')}
                activeOpacity={0.8}
                underlayColor={Theme.colors.color3}
              >
                <View>
                  <Text style={[styles.buttonText, styles.buttonTextCountry]}>{I18n.t('login.brazilTitle')}</Text>

                  <Image
                    style={styles.iconArrow}
                    source={nextIcon}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonCountry]}
                onPress={() => this.onPressCountry('colombia')}
                activeOpacity={0.8}
                underlayColor={Theme.colors.color3}
              >
                <View>
                  <Text style={[styles.buttonText, styles.buttonTextCountry]}>{I18n.t('login.colombiaTitle')}</Text>

                  <Image
                    style={styles.iconArrow}
                    source={nextIcon}
                  />
                </View>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonCountry]}
                onPress={() => this.onPressCountry('indonesia')}
                activeOpacity={0.8}
                underlayColor={Theme.colors.color3}
              >
                <View>
                  <Text style={[styles.buttonText, styles.buttonTextCountry]}>{I18n.t('login.indonesiaTitle')}</Text>

                  <Image
                    style={styles.iconArrow}
                    source={nextIcon}
                  />
                </View>
              </TouchableHighlight>
            </View>
          </ScrollView>
        }
      </Modal>
    );
  }
}

Login.propTypes = {
  loginModal: React.PropTypes.bool.isRequired,
  setLoginModal: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired
};

export default Login;
