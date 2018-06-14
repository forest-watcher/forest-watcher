// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import {
  View,
  Text,
  TextInput
} from 'react-native';
import debounce from 'lodash/debounce';

import Theme from 'config/theme';
import styles from '../styles';

type State = {
  value: string
}

type Props = {
  question: Question,
  answer: Answer,
  onChange: (string) => void,
};

class InputTextCustom extends React.PureComponent<Props, State> {
  state = {
    value: this.props.answer.value || ''
  }

  onChange = (value: string) => {
    this.setState({ value });
    this.debouncedChange(value);
  }

  debouncedChange = debounce((value: string) => {
    const { answer, onChange } = this.props;
    onChange({ ...answer, value });
  }, 300)

  render() {
    const { question } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.label}>{question.label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            autoFocus={false}
            autoCorrect={false}
            style={styles.input}
            autoCapitalize="none"
            value={this.state.value}
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
