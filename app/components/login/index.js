import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  WebView,
  Modal,
  AsyncStorage
} from 'react-native';

import CONSTANTS from 'config/constants';
import Config from 'react-native-config';
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
          this.props.setLoginStatus(true);
          this.successTimer = this.getSuccessTimer();
        }
      } else {
        console.warn('Login incorrect');
      }
    }
    // TO-DO Handle error response
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
            <Text>Login</Text>
            <Button
              onPress={() => this.onPress('facebook')}
              title="Facebook"
              color="#000000"
            />
            <Button
              onPress={() => this.onPress('twitter')}
              title="Twitter"
              color="#000000"
            />
            <Button
              onPress={() => this.onPress('google')}
              title="Google+"
              color="#000000"
            />
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
