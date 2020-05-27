// @flow

import React, { Component } from 'react';
import { View, Image, ScrollView, Text, TextInput, TouchableHighlight } from 'react-native';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';
import { withSafeArea } from 'react-native-safe-area';
import ActionButton from 'components/common/action-button';
import Hyperlink from 'react-native-hyperlink';
import { GFW_FORGOT_PASSWORD_LINK } from 'config/constants';

const eyeIcon = require('assets/eyeIcon.png');

const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

type State = {
  email: string,
  password: string,
  showPassword: boolean
};

type Props = {
  componentId: string,
  emailLogin: (email: string, password: string) => void
};

export default class EmailLogin extends Component<Props, State> {
  static options() {
    return {
      topBar: {
        title: {
          text: i18n.t('login.emailLogin.loginWithEmail')
        }
      }
    };
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
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={'always'}
        >
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
          <ActionButton
            short
            left
            disabled={!this.enableLoginButton()}
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
      </SafeAreaView>
    );
  }
}
