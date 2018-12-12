// @flow

import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import styles from './styles';

const Timer = require('react-native-timer');

type Props = {
  type: string,
  text: string,
  autoDismissTimerMillis: number,
  componentId: string
};

class ToastNotification extends PureComponent<Props> {
  static options(passProps) {
    return {
      layout: {
        backgroundColor: 'transparent'
      }
    };
  }

  componentDidMount() {
    Timer.setTimeout(
      this,
      'dismissNotification',
      () => {
        Navigation.dismissOverlay(this.props.componentId);
      },
      this.props.autoDismissTimerMillis
    );
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'dismissNotification');
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

export const Types: { disable: string, error: string, success: string } = {
  disable: 'disable',
  error: 'error',
  success: 'success'
};

export function showNotification(notification: {
  type?: string,
  text: string,
  clearPrevious?: boolean,
  time?: number
}) {
  const { type, text, clearPrevious = true, time = 2 } = notification;
  if (clearPrevious) {
    //Navigation.dismissInAppNotification();
  }
  Navigation.showOverlay({
    component: {
      name: 'ForestWatcher.ToastNotification',
      passProps: {
        type,
        text,
        autoDismissTimerMillis: time * 1000
      }
    }
  });
}

export default ToastNotification;
