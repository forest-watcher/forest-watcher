import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  WebView,
  Modal,
  AsyncStorage,
  TouchableHighlight
} from 'react-native';

import CONSTANTS from 'config/constants';
import Config from 'react-native-config';
import Theme from 'config/theme';
import { getToken, setToken } from 'helpers/user';

import styles from './styles';

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
          : <View style={styles.container}>
            <View style={styles.intro}>
              <Text style={styles.introLabel}>FOREST WATCHER 2.0</Text>
            </View>
            <View style={styles.buttons}>
              <Text style={styles.buttonsLabel}>Sign in with a MyGFW account</Text>
              <TouchableHighlight
                style={[styles.button, styles.buttonFacebook]}
                onPress={() => this.onPress('facebook')}
                activeOpacity={0.8}
                underlayColor={Theme.socialNetworks.facebook}
              >
                <Text style={styles.buttonText}>Facebook</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonTwitter]}
                onPress={() => this.onPress('twitter')}
                activeOpacity={0.8}
                underlayColor={Theme.socialNetworks.twitter}
              >
                <Text style={styles.buttonText}>Twitter</Text>
              </TouchableHighlight>
              <TouchableHighlight
                style={[styles.button, styles.buttonGoogle]}
                onPress={() => this.onPress('google')}
                activeOpacity={0.8}
                underlayColor={Theme.socialNetworks.google}
              >
                <Text style={styles.buttonText}>Google</Text>
              </TouchableHighlight>
            </View>
          </View>
        }
      </Modal>
    );
  }
}

Login.propTypes = {
  loginModal: React.PropTypes.bool.isRequired,
  setLoginModal: React.PropTypes.func.isRequired,
  setLoginStatus: React.PropTypes.func.isRequired,
  navigate: React.PropTypes.func.isRequired
};

export default Login;
