// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import { View, Text, TextInput } from 'react-native';

import Theme from 'config/theme';
import styles from '../styles';

type State = {
  value: string
};

type Props = {
  question: Question,
  answer: Answer,
  onChange: Answer => void,
  containerStyle?: ?any,
  labelStyle?: ?any,
  placeHolder?: ?string
};

class InputTextCustom extends React.PureComponent<Props, State> {
  state = {
    value: this.props.answer.value || ''
  };

  onChange = (value: string) => {
    const { answer, onChange } = this.props;
    this.setState({ value });
    onChange({ ...answer, value });
  };

  render() {
    const { question } = this.props;
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <Text style={[styles.label, this.props.labelStyle]}>{question.label}</Text>
        <View style={styles.inputContainer}>
          <TextInput
            autoFocus={false}
            autoCorrect={false}
            style={styles.input}
            autoCapitalize="none"
            value={this.state.value}
            onChangeText={this.onChange}
            placeholder={this.props.placeHolder || question.defaultValue}
            underlineColorAndroid="transparent"
            selectionColor={Theme.colors.turtleGreen}
            placeholderTextColor={Theme.fontColors.light}
          />
        </View>
      </View>
    );
  }
}

export default InputTextCustom;
