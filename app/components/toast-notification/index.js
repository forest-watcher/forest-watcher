// @flow

import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import styles from './styles';

type Props = {
  type: string,
  text: string
};

class ToastNotification extends PureComponent<Props> {

  componentWillUnmount() {
    Navigation.dismissInAppNotification();
  }

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
  disable: 'disable',
  error: 'error',
  success: 'success'
};

export function showNotification(notification: { type?: string, text: string, clearPrevious?: boolean, time?: number }) {
  const { type, text = '', clearPrevious = true, time = 2 } = notification;
  if (clearPrevious) {
    Navigation.dismissInAppNotification();
  }
  if (text) {
    Navigation.showInAppNotification({
      screen: 'ForestWatcher.ToastNotification',
      passProps: {
        type,
        text
      },
      autoDismissTimerSec: time
    });
  }
}

export default ToastNotification;
