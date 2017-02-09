import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const nextIcon = require('assets/next.png');
const nextIconWhite = require('assets/next_white.png');

function ActionButton(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress();
    }
  }
  const btnStyles = [
    styles.container,
    props.light ? styles.light : '',
    props.disabled ? styles.disabled : '',
    props.style
  ];
  let underlayColor = Theme.background.secondary;
  if (props.light) underlayColor = Theme.background.white;
  if (props.disabled) underlayColor = Theme.colors.color6;
  return (
    <TouchableHighlight
      style={btnStyles}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={underlayColor}
    >
      <View style={[styles.button, props.light ? styles.buttonLight : '']}>
        <Text style={[styles.buttonText, props.light ? styles.buttonTextLight : '']}>{props.text}</Text>
        <Image style={Theme.icon} source={props.light ? nextIcon : nextIconWhite} />
      </View>
    </TouchableHighlight>
  );
}

ActionButton.defaultProps = {
  disabled: false
};

ActionButton.propTypes = {
  light: React.PropTypes.bool,
  style: React.PropTypes.node,
  disabled: React.PropTypes.bool,
  text: React.PropTypes.string.isRequired,
  onPress: React.PropTypes.func.isRequired
};

export default ActionButton;
