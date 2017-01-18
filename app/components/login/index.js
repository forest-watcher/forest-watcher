import React, { Component } from 'react';
import {
  View,
  Text,
  Button,
  WebView,
  Modal
} from 'react-native';

import Config from 'react-native-config';
import styles from './styles';

class Login extends Component {
  constructor() {
    super();

    this.state = {
      modalVisible: false,
      webViewUrl: '',
      webViewCurrenUrl: '',
      webViewStatus: null
    };
    this.onLoadEnd = this.onLoadEnd.bind(this);
    this.onNavigationStateChange = this.onNavigationStateChange.bind(this);
  }

  onLoadEnd() {
    if (this.state.webViewCurrenUrl.indexOf(Config.API_CALLBACK_URL) !== -1) {
      this.props.onNavigate({
        key: 'setup',
        section: 'setup'
      });
      this.setState({
        modalVisible: false
      });
    }
    // TO-DO Handle error response
  }

  onPress(socialNetwork) {
    const url = `${Config.API_URL}/auth/${socialNetwork}?callbackUrl=${Config.API_CALLBACK_URL}`;

    this.setState({
      modalVisible: true,
      webViewUrl: url
    });
  }

  onNavigationStateChange(navState) {
    this.setState({
      webViewCurrenUrl: navState.url,
      webViewStatus: navState.title
    });
  }

  setModalVisible(visible) {
    this.setState({
      modalVisible: visible
    });
  }

  render() {
    return (
      <View style={styles.container}>
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

        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => this.setModalVisible(false)}
        >
          <View style={styles.modal}>
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
        </Modal>
      </View>
    );
  }
}

Login.propTypes = {
  onNavigate: React.PropTypes.func.isRequired
};

export default Login;
