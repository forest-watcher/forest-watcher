// @flow

import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import styles from './styles';

import { withSafeArea } from 'react-native-safe-area';

const SafeAreaView = withSafeArea(View, 'padding', 'top');
const Timer = require('react-native-timer');

type Props = {
  type: string,
  text: string,
  description?: ?string,
  autoDismissTimerMillis: number,
  componentId: string
};

class ToastNotification extends PureComponent<Props> {
  static options(passProps: {}) {
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
    const { type, text, description } = this.props;
    return (
      <SafeAreaView style={[styles.view, styles[type]]}>
        <View style={styles.internalView}>
          <Text style={[styles.text, styles[`${type}Text`]]}>{text}</Text>
          {description && <Text style={[styles.description, styles[`${type}Text`]]}>{description}</Text>}
        </View>
      </SafeAreaView>
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
  description: ?string,
  clearPrevious?: boolean,
  time?: number
}) {
  const { type, text, description, clearPrevious = true, time = 2 } = notification;
  if (clearPrevious) {
    //Navigation.dismissInAppNotification();
  }
  Navigation.showOverlay({
    component: {
      name: 'ForestWatcher.ToastNotification',
      passProps: {
        type,
        text,
        description,
        autoDismissTimerMillis: time * 1000
      },
      options: {
        layout: {
          backgroundColor: 'transparent',
          componentBackgroundColor: 'transparent'
        },
        modalPresentationStyle: 'overCurrentContext',
        overlay: {
          interceptTouchOutside: false
        }
      }
    }
  });
}

export default ToastNotification;
