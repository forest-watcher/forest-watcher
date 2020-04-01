// @flow

import React, { Component } from 'react';
import { Image, Platform, Text, TouchableHighlight, TouchableNativeFeedback, View } from 'react-native';
import styles from './styles';
import Theme from 'config/theme';

const rightArrow = require('assets/next.png');

type Props = {
  title: string,
  subtitle: string,
  style: *
};

export default class InfoBanner extends Component<Props> {
  render() {
    const Touchable = Platform.select({
      android: TouchableNativeFeedback,
      ios: TouchableHighlight
    });

    return (
      <Touchable
        activeOpacity={this.props.onPress ? this.props.opacity || 0.5 : 1}
        background={Platform.select({
          android: TouchableNativeFeedback.Ripple(Theme.background.gray),
          ios: undefined
        })}
        underlayColor="transparent"
        onPress={this.props.onPress}
      >
        <View style={[styles.container, this.props.style]}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{this.props.title || ''}</Text>
            <Text style={styles.subtitle}>{this.props.subtitle || ''}</Text>
          </View>
          <Image source={rightArrow} />
        </View>
      </Touchable>
    );
  }
}
