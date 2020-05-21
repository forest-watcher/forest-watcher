// @flow

import React, { Component } from 'react';
import { View, Image, ScrollView, Text, TextInput, TouchableHighlight } from 'react-native';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';
import { withSafeArea } from 'react-native-safe-area';
import ActionButton from 'components/common/action-button';


const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

type State = {
  email: string,
  password: string,
  showPassword: boolean
};

type Props = {
  componentId: string
};

export default class EmailLogin extends Component<Props, State> {
  static options() {
    return {
      topBar: {
        title: {
          text: 'Login With Email'
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      showPassword: false
    };
  }
  // todo keyboard type -> add to imported layer rename screen

  onEmailChange = (email: string) => {
    this.setState({ email });
  };

  onPasswordChange = (password: string) => {
    this.setState({ password });
  };

  onLoginPressed = debounceUI(() => {});

  onShowPasswordPressed = debounceUI(() => {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  });

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps={'always'}
        >
          <Text style={styles.title}>{'Email Address'}</Text>
          <TextInput
            autoCorrect={false}
            multiline={false}
            style={styles.input}
            autoCapitalize="none"
            value={this.state.email}
            onChangeText={this.onEmailChange}
            underlineColorAndroid="transparent"
            selectionColor={Theme.colors.turtleGreen}
            placeholder={'Enter Your Email'}
            placeholderTextColor={Theme.fontColors.light}
          />
          <Text style={styles.title}>{'Password'}</Text>
          <TextInput
            autoCorrect={false}
            multiline={false}
            style={styles.input}
            autoCapitalize="none"
            value={this.state.email}
            onChangeText={this.onEmailChange}
            underlineColorAndroid="transparent"
            selectionColor={Theme.colors.turtleGreen}
            placeholder={'Enter Your Password'}
            placeholderTextColor={Theme.fontColors.light}
          />
          <ActionButton style={styles.actionButton} onPress={() => {}} text={'Login'} />
        </ScrollView>
      </SafeAreaView>
    );
  }
}
