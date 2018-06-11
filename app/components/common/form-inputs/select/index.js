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

function SelectInput(props: Props) {
  const { onChange, question, answer } = props;
  function handlePress(value) {
    const newVal = [...answer.value];
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
  const hasValues = question && question.values && question.values.length;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{question.label}</Text>
      <ScrollView
        style={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {hasValues && question.values.map((item, index) => {
          const checked = answer.value && answer.value.indexOf(item.value) >= 0;
          const { childQuestions } = question;
          return (
            <React.Fragment key={index}>
              <View style={styles.inputContainer}>
                <CheckBtn
                  label={item.label}
                  checked={checked}
                  onPress={() => handlePress(item.value)}
                />
              </View>
              {childQuestions && childQuestions.conditionalValue === item.value &&
                <TextInput
                  visible={checked}
                  question={childQuestions}
                  answer={answer.child || {}}
                  onChange={onChildPress}
                />
              }
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default SelectInput;
