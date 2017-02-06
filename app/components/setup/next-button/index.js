import React from 'react';
import {
  Text,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

function NextButton(props) {
  return (
    <TouchableHighlight
      style={styles.button}
      onPress={props.onPress}
      activeOpacity={0.8}
      underlayColor={Theme.background.secondary}
    >
      <Text style={styles.buttonText}>{props.text}</Text>
    </TouchableHighlight>
  );
}

NextButton.propTypes = {
  text: React.PropTypes.string.isRequired,
  onPress: React.PropTypes.func.isRequired
};

export default NextButton;
