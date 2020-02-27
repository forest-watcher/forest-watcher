// @flow

import React, { Component, type ElementConfig } from 'react';

import { View, Text, TouchableHighlight, TouchableNativeFeedback, Image, Platform } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';

type Props = {
  ...ElementConfig<typeof TouchableHighlight>,
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
      <Touchable
        style={[styles.container, this.props.style, this.props.disabled ? styles.disabled : {}]}
        onPress={onPress}
        background={Platform.select({
          android: TouchableNativeFeedback.Ripple(underlayColor),
          ios: undefined
        })}
        activeOpacity={0.8}
        disabled={this.props.disabled}
      >
        <View style={styles.content}>
          <Image style={styles.icon} source={settingsCogIcon} />
          <Text style={styles.text}>{this.props.title ?? 'Settings'}</Text>
        </View>
      </Touchable>
    );
  }
}

export default SettingsButton;
