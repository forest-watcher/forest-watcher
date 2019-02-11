// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import { View, Text } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CheckBtn from 'components/common/form-inputs/check-btn';
import TextInput from '../text-detail';
import styles from '../styles';

type Props = {
  question: Question,
  answer: Answer,
  onChange: Answer => void
};

function SelectInput(props: Props) {
  const { onChange, question, answer } = props;
  function handlePress(value) {
    const newVal = Array.isArray(answer.value) ? [...answer.value] : [];
    const index = newVal.indexOf(value);
    if (index >= 0) {
      newVal.splice(index, 1);
    } else {
      newVal.push(value);
    }
    onChange({
      ...answer,
      value: newVal
    });
  }

  function onChildPress(value) {
    onChange({
      ...answer,
      child: {
        ...answer.child,
        value
      }
    });
  }
  const hasValues = question && question.values && !!question.values.length;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      <KeyboardAwareScrollView style={styles.containerContent}>
        {hasValues &&
          question.values.map((item, index) => {
            const checked = !!answer.value && answer.value.indexOf(item.value) >= 0;
            const { childQuestion } = question;
            return (
              <View key={index}>
                <View style={styles.inputContainer}>
                  <CheckBtn label={item.label} checked={checked} onPress={() => handlePress(item.value)} />
                </View>
                {childQuestion && childQuestion.conditionalValue === item.value && (
                  <TextInput
                    visible={checked}
                    question={childQuestion}
                    answer={answer.child || {}}
                    onChange={onChildPress}
                  />
                )}
              </View>
            );
          })}
      </KeyboardAwareScrollView>
    </View>
  );
}

export default SelectInput;
