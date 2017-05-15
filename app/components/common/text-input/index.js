import React from 'react';
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
        onChangeText={props.onChange}
        placeholder={props.placeholder}
        underlineColorAndroid="transparent"
        selectionColor={Theme.colors.color1}
        placeholderTextColor={Theme.fontColors.light}
      />
    </View>
  );
}

InputText.propTypes = {
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  placeholder: React.PropTypes.string
};

export default InputText;
