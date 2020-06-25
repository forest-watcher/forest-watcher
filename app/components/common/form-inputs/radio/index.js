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

function RadioInput(props: Props) {
  const { onChange, question, answer } = props;
  function handlePress(value) {
    if (value !== answer.value) {
      onChange({
        ...answer,
        value
      });
    }
  }
  function onChildChange(value) {
    const { child } = answer;
    if (child && value !== child.value) {
      onChange({
        ...answer,
        child: {
          ...answer.child,
          value
        }
      });
    }
  }

  const { childQuestion } = question;
  const hasValues: boolean = (question?.values?.length ?? 0) > 0;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      <KeyboardAwareScrollView style={styles.containerContent}>
        {hasValues &&
          // $FlowFixMe
          question.values?.map((item, index) => (
            <React.Fragment key={index}>
              <View style={styles.inputContainer} key="container">
                <CheckBtn
                  label={item.label}
                  checked={answer.value === item.value}
                  onPress={() => handlePress(item.value)}
                />
              </View>
              {childQuestion && childQuestion.conditionalValue === item.value && (
                <TextInput
                  visible={answer.value === item.value}
                  question={childQuestion}
                  onChange={onChildChange}
                  answer={answer.child || {}}
                />
              )}
            </React.Fragment>
          ))}
      </KeyboardAwareScrollView>
    </View>
  );
}

export default RadioInput;
