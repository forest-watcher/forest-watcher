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
      style={styles.container}
      underlayColor="transparent"
      onPress={props.onPress}
    >
      <View style={styles.input}>
        {props.value &&
          <Text style={styles.inputLabel}>{props.value}</Text>
        }
        <Image
          style={Theme.icon}
          source={props.checked ? checkOnIcon : checkOffIcon}
        />
      </View>
    </TouchableHighlight>
  );
}

CheckboxInput.propTypes = {
  value: React.PropTypes.string,
  checked: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.string
  ]),
  onPress: React.PropTypes.func.isRequired
};

export default CheckboxInput;
