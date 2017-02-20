import React from 'react';
import {
  View,
  TextInput
} from 'react-native';

import Theme from 'config/theme';
import styles from '../styles';


function InputTextDetail(props) {
  return (
    <View style={[styles.inputContainer, styles.inputContainerTransparent]}>
      <TextInput
        autoFocus
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
  );
}

InputTextDetail.propTypes = {
  question: React.PropTypes.shape({
    label: React.PropTypes.string,
    defaultValue: React.PropTypes.string
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

export default InputTextDetail;
