import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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
import { version } from 'package.json' // eslint-disable-line
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import { getLanguage } from 'helpers/language';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/pt';
import 'moment/locale/id';

import styles from './styles';

const logoIcon = require('assets/logo_dark.png');
const facebookIcon = require('assets/facebook_white.png');
const twitterIcon = require('assets/twitter_white.png');
const googleIcon = require('assets/google_white.png');
const nextIcon = require('assets/next_white.png');

// Set global moment internationalization
moment.locale(getLanguage());

class Login extends PureComponent {
  static navigatorStyle = {
    navBarHidden: true
  };

  constructor(props) {
    super(props);

    this.state = {
      webviewVisible: false,
      webViewUrl: '',
      webViewCurrenUrl: '',
      webViewStatus: null,
      socialNetwork: null
    };
    this.onLoadEnd = this.onLoadEnd.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
  }

  componentDidMount() {
    tracker.trackScreenView('Login');
  }

  componentDidUpdate(prevProps) {
    if (this.props.loggedIn) this.onLoggedIn();

    if (prevProps.logSuccess !== this.props.logSuccess || prevProps.isConnected !== this.props.isConnected) {
      this.ensureLogout();
    }
  }

  setWebviewRef = (ref) => {
    this.webView = ref;
  }

  onLoadEnd() {
    if (this.state.webViewCurrenUrl.indexOf(Config.API_AUTH_CALLBACK_URL) !== -1) {
      let token = this.state.webViewCurrenUrl.match(/token[=](.*)/);

      if (token && token[1]) {
        token = token[1].replace('#', '');
        this.props.setLoginAuth({
          token,
          socialNetwork: this.state.socialNetwork,
          loggedIn: true
        });
      } else {
        console.warn('Login incorrect');
      }
    }
  }

  onPress(socialNetwork) {
    if (this.props.isConnected) {
      this.setState({ socialNetwork });
      const provider = {
        google: this.props.googleLogin,
        facebook: this.props.facebookLogin,
        twitter: this.webViewProvider
      }[socialNetwork];
      return provider(socialNetwork);
    }

    return Alert.alert(
      I18n.t('login.unable'),
      I18n.t('login.connectionRequired'),
      [{ text: 'OK' }]
    );
  }

  onNavigationStateChange(navState) {
    this.setState({
      webViewCurrenUrl: navState.url,
      webViewStatus: navState.title
    });
  }

  onLoggedIn() {
    this.setState({
      webviewVisible: false,
      webViewUrl: ''
    });
    this.props.navigator.resetTo({
      screen: 'ForestWatcher.Home'
    });
  }

  ensureLogout() {
    const { logSuccess, logout, loggedIn, isConnected } = this.props;
    if (!loggedIn && !logSuccess && isConnected) {
      Alert.alert(
        I18n.t('commonText.error'),
        I18n.t('login.failed'),
        [{ text: 'OK', onPress: logout }]
      );
    }
  }

  closeWebview = () => {
    this.setState({
      webviewVisible: false
    });
  }

  webViewProvider = (socialNetwork) => {
    const url = `${Config.API_AUTH}/auth/${socialNetwork}?token=true&callbackUrl=${Config.API_AUTH_CALLBACK_URL}`;
    this.setState({
      socialNetwork,
      webviewVisible: true,
      webViewUrl: url
    });
  }

  renderWebview() {
    return (
      <View style={styles.modal}>
        <View style={styles.webViewHeader}>
          <TouchableHighlight
            style={styles.webViewButtonClose}
            onPress={this.closeWebview}
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
          ref={this.setWebviewRef}
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
    );
  }

  render() {
    return (
      this.state.webviewVisible
        ? this.renderWebview()
        : <ScrollView style={styles.container}>
          <View style={styles.intro}>
            <Image
              style={styles.logo}
              source={logoIcon}
            />
          </View>
          <View style={styles.bottomContainer}>
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
            </View>
            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>v{version}</Text>
            </View>
          </View>
        </ScrollView>
    );
  }
}

Login.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  logSuccess: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  isConnected: PropTypes.bool.isRequired,
  facebookLogin: PropTypes.func.isRequired,
  googleLogin: PropTypes.func.isRequired,
  setLoginAuth: PropTypes.func.isRequired,
  navigator: PropTypes.object.isRequired
};

export default Login;
