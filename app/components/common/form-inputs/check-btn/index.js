import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from '../styles';

const checkOnIcon = require('assets/checkbox_on.png');
const checkOffIcon = require('assets/checkbox_off.png');

function CheckboxInput(props) {
  return (
    <TouchableHighlight
      style={styles.inputContainer}
      underlayColor={Theme.background.white}
      onPress={props.onPress}
    >
      <View style={styles.input}>
        <Text style={styles.inputLabel}>{props.value}</Text>
        <Image
          style={Theme.icon}
          source={props.checked ? checkOnIcon : checkOffIcon}
        />
      </View>
    </TouchableHighlight>
  );
}

CheckboxInput.propTypes = {
  checked: React.PropTypes.bool.isRequired,
  value: React.PropTypes.string.isRequired,
  onPress: React.PropTypes.func.isRequired
};

export default CheckboxInput;
