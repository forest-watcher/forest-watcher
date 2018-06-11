// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';

import CheckBtn from 'components/common/form-inputs/check-btn';
import TextInput from '../text-detail';

import styles from '../styles';

type Props = {
  question: Question,
  answer: Answer,
  onChange: (Answer) => void,
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
    if (value !== answer.child.value) {
      onChange({
        ...answer,
        child: {
          ...answer.child,
          value
        }
      });
    }
  }

  const { childQuestions } = question;
  const hasValues = question && question.values && question.values.length;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      <ScrollView
        style={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {hasValues && question.values.map((item, index) => (
          <React.Fragment key={index}>
            <View style={styles.inputContainer} key="container">
              <CheckBtn
                label={item.label}
                checked={answer.value === item.value}
                onPress={() => handlePress(item.value)}
              />
            </View>
            {childQuestions && childQuestions.conditionalValue === item.value &&
              <TextInput
                visible={answer.value === item.value}
                question={childQuestions}
                onChange={onChildChange}
                answer={answer.child || {}}
              />
            }
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

export default RadioInput;
