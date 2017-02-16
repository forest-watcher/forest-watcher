import React from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from '../styles';

const checkOnIcon = require('assets/checkbox_on.png');
const checkOffIcon = require('assets/checkbox_off.png');

function SelectInput(props) {
  function handlePress(value) {
    const newVal = [...props.input.value];
    const index = newVal.indexOf(value);
    if (index >= 0) {
      newVal.splice(index, 1);
    } else {
      newVal.push(value);
    }
    props.input.onChange(newVal);
  }
  return (
    <View>
      <Text style={styles.label}>{props.question.label}</Text>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
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
                source={props.input.value.indexOf(value) >= 0 ? checkOnIcon : checkOffIcon}
              />
            </View>
          </TouchableHighlight>
        ))}
      </ScrollView>
    </View>
  );
}

SelectInput.propTypes = {
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

export default SelectInput;
