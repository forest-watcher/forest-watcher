import React from 'react';
import {
  View,
  Text
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';


function InputText(props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>YES</Text>
        <Text style={styles.label}>NO</Text>
      </View>
    </View>
  );
}

InputText.propTypes = {
  label: React.PropTypes.string.isRequired,
  values: React.PropTypes.array.isRequired,
  defaultValue: React.PropTypes.string,
  value: React.PropTypes.string
};

export default InputText;
