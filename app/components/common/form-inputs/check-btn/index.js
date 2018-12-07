import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, TouchableHighlight } from 'react-native';

import Theme from 'config/theme';
import styles from '../styles';

const checkOnIcon = require('assets/checkbox_on.png');
const checkOffIcon = require('assets/checkbox_off.png');

function CheckboxInput(props) {
  return (
    <TouchableHighlight style={styles.container} underlayColor="transparent" onPress={props.onPress}>
      <View style={styles.checkboxInput}>
        {props.label && <Text style={styles.inputLabel}>{props.label}</Text>}
        <Image style={Theme.icon} source={props.checked ? checkOnIcon : checkOffIcon} />
      </View>
    </TouchableHighlight>
  );
}

CheckboxInput.propTypes = {
  label: PropTypes.string,
  checked: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onPress: PropTypes.func.isRequired
};

export default CheckboxInput;
