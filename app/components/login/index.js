import React, { Component } from 'react';
import {
  Alert,
  View,
  Text,
  WebView,
  TouchableHighlight,
  ScrollView,
  Image
} from 'react-native';

import Config from 'react-native-config';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';

import GoogleOAuth from '../../config/oAuth/GoogleOAuth';
import styles from './styles';

const logoIcon = require('assets/logo.png');
const facebookIcon = require('assets/facebook_white.png');
const twitterIcon = require('assets/twitter_white.png');
const googleIcon = require('assets/google_white.png');
const nextIcon = require('assets/next_white.png');

class Login extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

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

  onLoadEnd() {
    if (this.state.webViewCurrenUrl.indexOf(Config.API_AUTH_CALLBACK_URL) !== -1) {
      let token = this.state.webViewCurrenUrl.match(/token[=](.*)/);

      if (token && token[1]) {
        token = token[1].replace('#', '');
        this.props.setLoginStatus({
          loggedIn: true,
          token
        });
        this.successTimer = this.getSuccessTimer();
      } else {
        console.warn('Login incorrect');
      }
    }
  }

  onPress(socialNetwork) {
    if (this.props.isConnected) {
      const url = `${Config.API_AUTH}/auth/${socialNetwork}?token=true&callbackUrl=${Config.API_AUTH_CALLBACK_URL}`;

      this.setState({
        webviewVisible: true,
        webViewUrl: url
      });
    } else {
      Alert.alert(
        I18n.t('login.unable'),
        I18n.t('login.connectionRequired'),
        [{ text: 'OK' }]
      );
    }
  }

  onPressGoogle = () => {
    GoogleOAuth.login()
    .then((user) => {
      fetch(`${Config.API_AUTH}/auth/google/token?access_token=${user.accessToken}`)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error(response.statusText);
      })
      .then(data => {
        this.props.setLoginStatus({
          loggedIn: true,
          token: data.token
        });
        this.props.navigator.resetTo({
          screen: 'ForestWatcher.Home'
        });
      })
      .catch((error) => {
        console.warn(error);
        // To-do
      });
    });
  }

  onNavigationStateChange(navState) {
    this.setState({
      webViewCurrenUrl: navState.url,
      webViewStatus: navState.title
    });
  }

  getSuccessTimer() {
    return setTimeout(() => {
      this.setState({
        webviewVisible: false,
        webViewUrl: ''
      });
      this.props.navigator.resetTo({
        screen: 'ForestWatcher.Home'
      });
    }, 1000);
  }

  closeWebview() {
    this.setState({
      webviewVisible: false
    });
  }

  render() {
    return (
      this.state.webviewVisible
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
              onPress={this.onPressGoogle}
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
          </View>
        </ScrollView>
    );
  }
}

Login.propTypes = {
  isConnected: React.PropTypes.bool.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired,
  navigator: React.PropTypes.object.isRequired
};

export default Login;
