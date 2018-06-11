// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import {
  View,
  Text,
  TextInput
} from 'react-native';

import Theme from 'config/theme';
import styles from '../styles';

type Props = {
  question: Question,
  answer: Answer,
  onChange: (string) => void,
};

function InputNumber(props: Props) {
  function handleChange(value) {
    if (value !== props.answer.value) {
      props.onChange({
        ...props.answer,
        value
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          keyboardType="numeric"
          autoFocus={false}
          autoCorrect={false}
          style={styles.input}
          autoCapitalize="none"
          value={props.answer.value}
          onChangeText={handleChange}
          placeholder={props.question.defaultValue}
          underlineColorAndroid="transparent"
          selectionColor={Theme.colors.color1}
          placeholderTextColor={Theme.fontColors.light}
        />
      </View>
    </View>
  );
}

export default InputNumber;
