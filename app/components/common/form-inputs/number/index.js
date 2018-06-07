import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Theme from 'config/theme';
import styles from '../styles';


function InputNumber(props) {
  return (
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>{props.question.label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            keyboardType="numeric"
            autoFocus={false}
            autoCorrect={false}
            style={styles.input}
            autoCapitalize="none"
            value={props.input.value}
            onChangeText={props.input.onChange}
            placeholder={props.question.defaultValue}
            underlineColorAndroid="transparent"
            selectionColor={Theme.colors.color1}
            placeholderTextColor={Theme.fontColors.light}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

InputNumber.propTypes = {
  question: PropTypes.shape({
    label: PropTypes.string,
    defaultValue: PropTypes.string
  }).isRequired,
  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired
};

export default InputNumber;
