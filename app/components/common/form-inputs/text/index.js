import React from 'react';
import {
  View,
  Text,
  TextInput
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';


function InputText(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.inputLabel}>{props.label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          ref={(ref) => { this.input = ref; }}
          autoFocus={false}
          autoCorrect={false}
          autoCapitalize="none"
          value={props.value}
          placeholder={props.defaultValue}
          style={styles.input}
          onChangeText={props.onChange}
          underlineColorAndroid="transparent"
          selectionColor={Theme.colors.color1}
          placeholderTextColor={Theme.fontColors.light}
        />
      </View>
    </View>
  );
}

InputText.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  defaultValue: React.PropTypes.string,
  value: React.PropTypes.string
};

export default InputText;
