// @flow
import type { Thunk } from 'types/store.types';
import type { UserAction } from 'types/user.types';

import React, { Component } from 'react';
import { View, Image, Text, TextInput, TouchableHighlight, ActivityIndicator, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';
import ActionButton from 'components/common/action-button';
import Hyperlink from 'react-native-hyperlink';
import { GFW_FORGOT_PASSWORD_LINK } from 'config/constants';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

const backIcon = require('assets/backButton.png');
const eyeIcon = require('assets/eyeIcon.png');

type State = {
  email: string,
  password: string,
  showPassword: boolean
};

type Props = {
  componentId: string,
  emailLogin: (email: string, password: string) => Thunk<Promise<void>>,
  loginError: ?string,
  clearEmailLoginError: () => UserAction,
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
        },
        backButton: {
          icon: backIcon,
          id: 'backButton'
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
    Navigation.events().bindComponent(this);

    this.state = {
      email: '',
      password: '',
      showPassword: false
    };
  }

  componentDidMount() {
    this.props.clearEmailLoginError();
  }

  navigationButtonPressed({ buttonId }: { buttonId: NavigationButtonPressedEvent }) {
    if (buttonId === 'backButton') {
      Keyboard.dismiss();
      setTimeout(() => {
        // wait for keyboard to dismiss, otherwise causes weird bounce animation on next screen
        Navigation.pop(this.props.componentId);
      }, 100);
    }
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
    Keyboard.dismiss();
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
        <KeyboardAwareScrollView
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
              // $FlowFixMe
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
        </KeyboardAwareScrollView>
      </View>
    );
  }
}
