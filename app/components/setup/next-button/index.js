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
  return (
    <TouchableHighlight
      style={styles.container}
      onPress={props.onPress}
      activeOpacity={0.8}
      underlayColor={Theme.background.secondary}
    >
      <View style={styles.button}>
        <Text style={styles.buttonText}>{props.text}</Text>
        <Image style={Theme.icon} source={nextIcon} />
      </View>
    </TouchableHighlight>
  );
}

NextButton.propTypes = {
  text: React.PropTypes.string.isRequired,
  onPress: React.PropTypes.func.isRequired
};

export default NextButton;
