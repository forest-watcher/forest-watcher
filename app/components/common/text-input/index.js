import React from 'react';
import PropTypes from 'prop-types';
import { View, TextInput } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

function InputText(props) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        autoFocus={false}
        autoCorrect={false}
        style={styles.input}
        autoCapitalize="none"
        value={props.value}
        editable={props.editable ?? true}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        underlineColorAndroid="transparent"
        selectionColor={Theme.colors.turtleGreen}
        placeholderTextColor={Theme.fontColors.light}
      />
    </View>
  );
}

InputText.propTypes = {
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  placeholder: PropTypes.string,
  editable: PropTypes.bool
};

export default InputText;
