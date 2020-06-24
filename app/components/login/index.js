// @flow
import type { LoginProvider } from 'types/app.types';
import type { Thunk } from 'types/store.types';
import type { UserAction } from 'types/user.types';

import React, { PureComponent } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';

import SafeArea, { withSafeArea } from 'react-native-safe-area';
import Config from 'react-native-config';

import Theme from 'config/theme';
import i18n from 'i18next';
import { getVersionName } from 'helpers/app';
import debounceUI from 'helpers/debounceUI';
import { trackLogin, trackScreenView } from 'helpers/analytics';
import { getLanguage } from 'helpers/language';

const SafeAreaView = withSafeArea(View, 'padding', 'bottom');
const WebViewSafeAreaView = withSafeArea(View, 'padding', 'top');

import { launchAppRoot } from 'main';
import moment from 'moment';
import parseUrl from 'url-parse';

import 'moment/locale/es';
import 'moment/locale/fr';
import 'moment/locale/pt';
import 'moment/locale/id';

import styles from './styles';
import { Navigation } from 'react-native-navigation';
import Hyperlink from 'react-native-hyperlink';
import { GFW_SIGN_UP_LINK } from 'config/constants';

const headerImage = require('assets/login_bg.jpg');
const logoIcon = require('assets/logo_dark.png');
const emailIcon = require('assets/emailIcon.png');
const facebookIcon = require('assets/facebook_white.png');
const twitterIcon = require('assets/twitter_white.png');
const googleIcon = require('assets/google_white.png');
const nextIcon = require('assets/next_white.png');

// Set global moment internationalization
moment.locale(getLanguage());

type Props = {
  componentId: string,
  isConnected: boolean,
  loading: boolean,
  loggedIn: boolean,
  logSuccess: boolean,
  logout: (?string) => Thunk<void>,
  facebookLogin: () => Thunk<Promise<void>>,
  googleLogin: () => Thunk<Promise<void>>,
  setLoginAuth: ({
    token: string,
    socialNetwork: LoginProvider,
    loggedIn: boolean
  }) => UserAction
};

type State = {
  topSafeAreaInset: ?number,
  webviewVisible: boolean,
  webViewUrl: string,
  webViewCurrentUrl: string,
  socialNetwork: ?LoginProvider,
  versionName: string
};

class Login extends PureComponent<Props, State> {
  static options() {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  static renderLoading() {
    return (
      <View style={[styles.loaderContainer, styles.loader]}>
        <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size="large" />
      </View>
    );
  }

  webView: any;

  constructor(props: Props) {
    super(props);

    this.state = {
      topSafeAreaInset: 0,
      webviewVisible: false,
      webViewUrl: '',
      webViewCurrentUrl: '',
      socialNetwork: null,
      versionName: getVersionName()
    };
  }

  componentDidMount() {
    trackScreenView('Login');

    // Determine the current insets. This is so, for the page indictator view,
    // we can add additional padding to ensure the white background is extended
    // beyond the safe area.
    SafeArea.getSafeAreaInsetsForRootView().then(result => {
      return this.setState(state => ({
        topSafeAreaInset: result.safeAreaInsets.top
      }));
    });
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.loggedIn) {
      this.onLoggedIn();
    }

    if (prevProps.logSuccess !== this.props.logSuccess) {
      this.ensureLogout();
    }
  }

  setWebviewRef = (ref: any) => {
    this.webView = ref;
  };

  onLoadEnd = () => {
    if (!this.state.socialNetwork) {
      console.warn('3SC login error: no social network property');
      return;
    }

    const parsedUrl = parseUrl(this.state.webViewCurrentUrl, true);
    if (
      parsedUrl.origin === Config.API_AUTH &&
      parsedUrl.pathname === Config.API_AUTH_CALLBACK_PATH &&
      parsedUrl.query?.token
    ) {
      this.props.setLoginAuth({
        token: parsedUrl.query.token,
        // $FlowFixMe
        socialNetwork: this.state.socialNetwork,
        loggedIn: true
      });
    }
  };

  onPress = debounceUI((socialNetwork: LoginProvider) => {
    this.setState({ socialNetwork });

    if (socialNetwork === 'email') {
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.LoginEmail'
        }
      });
      return;
    }

    if (!this.props.isConnected) {
      Alert.alert(i18n.t('commonText.error'), i18n.t('login.mustBeOnline'), [{ text: 'OK' }]);
      return;
    }

    const provider = {
      google: this.props.googleLogin,
      facebook: this.props.facebookLogin,
      twitter: this.webViewProvider
    }[socialNetwork];

    provider();
  });

  onNavigationStateChange = (navState: { url: string, title: string }) => {
    this.setState({
      webViewCurrentUrl: navState.url
    });
  };

  onLoggedIn() {
    trackLogin(this.state.socialNetwork);

    this.setState({
      webviewVisible: false,
      webViewUrl: ''
    });
    launchAppRoot('ForestWatcher.Home');
  }

  ensureLogout() {
    const { logSuccess, logout, loggedIn } = this.props;
    if (!loggedIn && !logSuccess) {
      Alert.alert(i18n.t('commonText.error'), i18n.t('login.failed'), [{ text: 'OK', onPress: logout }]);
    }
  }

  closeWebview = () => {
    this.setState({
      webviewVisible: false
    });
  };

  webViewProvider = (socialNetwork: LoginProvider = 'twitter') => {
    const callbackUrl = `${Config.API_AUTH}${Config.API_AUTH_CALLBACK_PATH}`;
    const url = `${Config.API_AUTH}/auth/${socialNetwork}?token=true&callbackUrl=${callbackUrl}`;
    this.setState({
      socialNetwork,
      webviewVisible: true,
      webViewUrl: url
    });
  };

  renderWebview() {
    return (
      <WebViewSafeAreaView style={{ flex: 1 }}>
        <View
          style={[
            styles.webViewHeader,
            { marginTop: -(this.state.topSafeAreaInset ?? 0), height: 40 + (this.state.topSafeAreaInset ?? 0) }
          ]}
        >
          <TouchableHighlight
            style={styles.webViewButtonClose}
            onPress={this.closeWebview}
            activeOpacity={0.8}
            underlayColor="transparent"
          >
            <Text style={styles.webViewButtonCloseText}>x</Text>
          </TouchableHighlight>
          <Text style={styles.webViewUrl} ellipsizeMode="tail" numberOfLines={1}>
            {this.state.webViewCurrentUrl}
          </Text>
        </View>
        <WebView
          ref={this.setWebviewRef}
          automaticallyAdjustContentInsets={false}
          source={{ uri: this.state.webViewUrl }}
          javaScriptEnabled
          domStorageEnabled
          decelerationRate="normal"
          onLoadEnd={this.onLoadEnd}
          onNavigationStateChange={this.onNavigationStateChange}
          startInLoadingState
        />
      </WebViewSafeAreaView>
    );
  }

  renderSignInPage() {
    return (
      <View style={styles.signInContainer}>
        {this.props.loading && Login.renderLoading()}
        <ImageBackground resizeMode="cover" style={styles.intro} source={headerImage}>
          <Image source={logoIcon} />
        </ImageBackground>
        <ScrollView
          style={styles.scrollView}
          alwaysBounceVertical={false}
          contentContainerStyle={{ paddingVertical: 8 }}
        >
          <Text style={styles.buttonsLabel}>{i18n.t('login.introductionText')}</Text>
          <TouchableHighlight
            style={[styles.button, styles.buttonEmail]}
            onPress={() => this.onPress('email')}
            activeOpacity={0.8}
            underlayColor={Theme.colors.turtleGreen}
            disabled={this.props.loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTitleContainer}>
                <Image resizeMode={'contain'} style={styles.iconEmail} source={emailIcon} />
                <Text style={styles.buttonText}>{i18n.t('login.emailTitle')}</Text>
              </View>
              <Image style={styles.iconArrow} source={nextIcon} />
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.button, styles.buttonFacebook]}
            onPress={() => this.onPress('facebook')}
            activeOpacity={0.8}
            underlayColor={Theme.socialNetworks.facebook}
            disabled={this.props.loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTitleContainer}>
                <Image resizeMode={'contain'} style={styles.iconFacebook} source={facebookIcon} />
                <Text style={styles.buttonText}>{i18n.t('login.facebookTitle')}</Text>
              </View>
              <Image style={styles.iconArrow} source={nextIcon} />
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.button, styles.buttonTwitter]}
            onPress={() => this.onPress('twitter')}
            activeOpacity={0.8}
            underlayColor={Theme.socialNetworks.twitter}
            disabled={this.props.loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTitleContainer}>
                <Image resizeMode={'contain'} style={styles.iconTwitter} source={twitterIcon} />
                <Text style={styles.buttonText}>{i18n.t('login.twitterTitle')}</Text>
              </View>
              <Image style={styles.iconArrow} source={nextIcon} />
            </View>
          </TouchableHighlight>
          <TouchableHighlight
            style={[styles.button, styles.buttonGoogle]}
            onPress={() => this.onPress('google')}
            activeOpacity={0.8}
            underlayColor={Theme.socialNetworks.google}
            disabled={this.props.loading}
          >
            <View style={styles.buttonContent}>
              <View style={styles.buttonTitleContainer}>
                <Image resizeMode={'contain'} style={styles.iconGoogle} source={googleIcon} />
                <Text style={styles.buttonText}>{i18n.t('login.googleTitle')}</Text>
              </View>
              <Image style={styles.iconArrow} source={nextIcon} />
            </View>
          </TouchableHighlight>
          <Hyperlink linkDefault linkText={i18n.t('login.signUp')}>
            <Text style={styles.linkStyle} selectable>
              {GFW_SIGN_UP_LINK}
            </Text>
          </Hyperlink>
          <Text style={styles.versionText}>{this.state.versionName}</Text>
        </ScrollView>
      </View>
    );
  }

  render() {
    const ContentView = this.state.webviewVisible ? View : SafeAreaView;
    return (
      <ContentView style={{ flex: 1 }}>
        {this.state.webviewVisible && this.renderWebview()}
        {!this.state.webviewVisible && this.renderSignInPage()}
      </ContentView>
    );
  }
}

export default Login;
