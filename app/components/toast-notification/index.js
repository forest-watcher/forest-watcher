// @flow

import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

type Props = {
  type: string,
  text: string
};

class ToastNotification extends PureComponent<Props> {

  render() {
    const { type, text } = this.props;
    return (
      <View style={[styles.view, styles[type]]}>
        <Text style={[styles.text, styles[`${type}Text`]]}>{text}</Text>
      </View>
    );
  }
}

export const Types = {
  error: 'error',
  success: 'success'
};

export default ToastNotification;
