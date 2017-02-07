import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const nextIcon = require('assets/next_white.png');

function NextButton(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress();
    }
  }
  return (
    <TouchableHighlight
      style={[styles.container, props.disabled ? styles.buttonDisabled : '']}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={props.disabled ? Theme.colors.color6 : Theme.background.secondary}
    >
      <View style={styles.button}>
        <Text style={styles.buttonText}>{props.text}</Text>
        <Image style={Theme.icon} source={nextIcon} />
      </View>
    </TouchableHighlight>
  );
}

NextButton.defaultProps = {
  disabled: false
};

NextButton.propTypes = {
  disabled: React.PropTypes.bool,
  text: React.PropTypes.string.isRequired,
  onPress: React.PropTypes.func.isRequired
};

export default NextButton;
