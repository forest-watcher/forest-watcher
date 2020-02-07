import React, { Component } from 'react';

import { View, Text, TouchableHighlight, TouchableNativeFeedback, Image } from 'react-native';
import styles from './styles';

type Props = {
  disabled?: boolean,
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

    return (
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
        <View style={styles.content}>
          <Image style={styles.icon} source={settingsCogIcon}/>
          <Text style={styles.text}>{this.props.title ?? "Settings"}</Text>
        </View>
      </Touchable>
    )
  }
}

export default SettingsButton;

