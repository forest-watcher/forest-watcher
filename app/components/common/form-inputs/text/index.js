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

function InputTextCustom(props: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          autoFocus={false}
          autoCorrect={false}
          style={styles.input}
          autoCapitalize="none"
          value={props.answer.value}
          onChangeText={props.onChange}
          placeholder={props.question.defaultValue}
          underlineColorAndroid="transparent"
          selectionColor={Theme.colors.color1}
          placeholderTextColor={Theme.fontColors.light}
        />
      </View>
    </View>
  );
}

export default InputTextCustom;
