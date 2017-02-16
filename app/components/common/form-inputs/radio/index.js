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

function RadioInput(props) {
  function handlePress(value) {
    if (value !== props.input.value) {
      props.input.onChange(value);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      {props.question.values.map((value, index) => (
        <TouchableHighlight
          key={index}
          style={styles.inputContainer}
          underlayColor={Theme.background.white}
          onPress={() => handlePress(value)}
        >
          <View style={styles.input}>
            <Text style={styles.inputLabel}>{value}</Text>
            <Image
              style={Theme.icon}
              source={props.input.value === value ? checkOnIcon : checkOffIcon}
            />
          </View>
        </TouchableHighlight>
      ))}
    </View>
  );
}

RadioInput.propTypes = {
  question: React.PropTypes.shape({
    label: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    values: React.PropTypes.array
  }).isRequired,
  input: React.PropTypes.shape({
    onBlur: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  }).isRequired,
  meta: React.PropTypes.shape({
    active: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    invalid: React.PropTypes.bool.isRequired,
    pristine: React.PropTypes.bool.isRequired,
    visited: React.PropTypes.bool.isRequired
  }).isRequired
};

export default RadioInput;
