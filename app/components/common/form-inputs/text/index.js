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

class InputTextCustom extends React.PureComponent<Props> {
  onChange = (value) => {
    const { answer, onChange } = this.props;
    onChange({ ...answer, value });
  }

  render() {
    const { answer, question } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{question.label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            autoFocus={false}
            autoCorrect={false}
            style={styles.input}
            autoCapitalize="none"
            value={answer.value}
            onChangeText={this.onChange}
            placeholder={question.defaultValue}
            underlineColorAndroid="transparent"
            selectionColor={Theme.colors.color1}
            placeholderTextColor={Theme.fontColors.light}
          />
        </View>
      </View>
    );
  }
}

export default InputTextCustom;
