import React from 'react';
import {
  View,
  Text,
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
      style={[styles.container, props.style]}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor="transparent"
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
  disabled: React.PropTypes.bool,
  onPress: React.PropTypes.func.isRequired
};

export default NextButton;
