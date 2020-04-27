// @flow

import React, { Component, type ElementConfig } from 'react';

import { View, Text, TouchableHighlight, TouchableNativeFeedback, Image, Platform } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';
import i18n from 'i18next';

type Props = {
  ...ElementConfig<typeof TouchableHighlight>,
  // greyed out state is used to reinforce that something is not currently visible on the map, but the button is not disabled!
  disabledStyle?: boolean,
  title?: string
};

const settingsCogIcon = require('assets/settings_cog.png');

class SettingsButton extends Component<Props> {
  render() {
    const { onPress } = this.props;

    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });

    const underlayColor = this.props.underlayColor ?? Theme.background.secondary;

    return (
      <View style={styles.margins}>
        <Touchable
          style={[styles.container, this.props.style]}
          onPress={onPress}
          background={Platform.select({
            android: TouchableNativeFeedback.Ripple(underlayColor),
            ios: undefined
          })}
          activeOpacity={0.8}
          disabled={this.props.disabled}
        >
          <View style={[styles.content, this.props.disabled || this.props.disabledStyle ? styles.disabled : {}]}>
            <Image source={settingsCogIcon} />
            <Text style={styles.text}>{this.props.title ?? i18n.t('commonText.settings')}</Text>
          </View>
        </Touchable>
      </View>
    );
  }
}

export default SettingsButton;
