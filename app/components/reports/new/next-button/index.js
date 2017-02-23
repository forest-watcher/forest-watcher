import React from 'react';
import {
  View,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const nextIconWhite = require('assets/next_white.png');

function NextButton(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress();
    }
  }
  return (
    <TouchableHighlight
      style={[styles.container, props.transparent ? styles.transparent : '', props.style]}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={props.transparent ? 'transparent' : Theme.background.secondary}
    >
      <View style={styles.button}>
        <Image style={Theme.icon} source={nextIconWhite} />
      </View>
    </TouchableHighlight>
  );
}

NextButton.defaultProps = {
  disabled: false
};

NextButton.propTypes = {
  style: React.PropTypes.node,
  transparent: React.PropTypes.bool,
  disabled: React.PropTypes.bool,
  onPress: React.PropTypes.func.isRequired
};

export default NextButton;
