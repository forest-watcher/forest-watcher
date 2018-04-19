import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import styles from './styles';

class ToastNotification extends PureComponent {
  static propTypes = {
    type: PropTypes.string,
    text: PropTypes.string
  };

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
  success: 'success'
};

export default ToastNotification;
