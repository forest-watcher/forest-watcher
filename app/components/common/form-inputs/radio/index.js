import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const radioEmpty = require('assets/close_white.png');
const radioChecked = require('assets/close.png');

function InputRadio(props) {
  return (
    <View style={styles.container}>
      {props.question.values.map((value, index) => (
        <View style={styles.inputContainer} key={index}>
          <Text style={styles.inputLabel}>{value}</Text>
          <TouchableHighlight
            underlayColor="transparent"
            onPress={() => props.input.onChange(value)}
          >
            <Image
              style={Theme.icon}
              source={props.input.value ? radioChecked : radioEmpty}
            />
          </TouchableHighlight>
        </View>
      ))}
    </View>
  );
}

InputRadio.propTypes = {
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

export default InputRadio;
