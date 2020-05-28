// @flow

import React, { Component } from 'react';
import { View, Image, ScrollView, Text, TextInput, TouchableHighlight, ActivityIndicator } from 'react-native';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';
import ActionButton from 'components/common/action-button';
import Hyperlink from 'react-native-hyperlink';
import { GFW_FORGOT_PASSWORD_LINK } from 'config/constants';

const eyeIcon = require('assets/eyeIcon.png');

type State = {
  email: string,
  password: string,
  showPassword: boolean
};

type Props = {
  componentId: string,
  emailLogin: (email: string, password: string) => void,
  loginError: ?string,
  clearEmailLoginError: () => Thunk<void>,
  loading: boolean
};

export default class EmailLogin extends Component<Props, State> {
  static options() {
    return {
      topBar: {
        title: {
          text: i18n.t('login.emailLogin.loginWithEmail')
        },
        background: {
          color: Theme.colors.veryLightPink
        }
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

  passwordTextInput: ?TextInput;

  constructor(props: Props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showPassword: false
    };
  }

  componentWillUnmount() {
    this.props.clearEmailLoginError();
  }

  onEmailChange = (email: string) => {
    this.setState({ email });
  };

  onPasswordChange = (password: string) => {
    this.setState({ password });
  };

  enableLoginButton = () => {
    return this.state.email && this.state.password;
  };

  onLoginPressed = debounceUI(() => {
    if (!this.enableLoginButton()) {
      return;
    }
    this.props.emailLogin(this.state.email, this.state.password);
  });

  onShowPasswordPressed = () => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={'always'}
        >
          {this.props.loading && EmailLogin.renderLoading()}
          <Text style={styles.title}>{i18n.t('login.emailLogin.emailAddress')}</Text>
          <TextInput
            autoCorrect={false}
            multiline={false}
            style={styles.input}
            autoCapitalize="none"
            value={this.state.email}
            onChangeText={this.onEmailChange}
            selectionColor={Theme.colors.turtleGreen}
            placeholder={i18n.t('login.emailLogin.enterYourEmail')}
            placeholderTextColor={Theme.fontColors.secondary}
            returnKeyType={'next'}
            onSubmitEditing={() => {
              this.passwordTextInput?.focus?.();
            }}
            blurOnSubmit={false}
          />
          <Text style={styles.title}>{i18n.t('login.emailLogin.password')}</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              ref={ref => {
                this.passwordTextInput = ref;
              }}
              autoCorrect={false}
              multiline={false}
              style={styles.input}
              autoCapitalize="none"
              secureTextEntry={!this.state.showPassword}
              value={this.state.password}
              onChangeText={this.onPasswordChange}
              selectionColor={Theme.colors.turtleGreen}
              placeholder={i18n.t('login.emailLogin.enterYourPassword')}
              placeholderTextColor={Theme.fontColors.secondary}
              returnKeyType={'done'}
              onSubmitEditing={this.onLoginPressed}
            />
            <TouchableHighlight activeOpacity={0.5} underlayColor="transparent" onPress={this.onShowPasswordPressed}>
              <Image style={styles.passwordIcon} source={eyeIcon} />
            </TouchableHighlight>
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.error, this.props.loginError ? {} : styles.hideError]}>{this.props.loginError}</Text>
          </View>
          <ActionButton
            short
            left
            disabled={!this.enableLoginButton() || this.props.loading}
            style={styles.actionButton}
            onPress={this.onLoginPressed}
            text={i18n.t('login.emailLogin.login')}
          />
          <Hyperlink linkDefault linkText={i18n.t('login.emailLogin.forgotYourPassword')}>
            <Text style={styles.linkStyle} selectable>
              {GFW_FORGOT_PASSWORD_LINK}
            </Text>
          </Hyperlink>
        </ScrollView>
      </View>
    );
  }
}
