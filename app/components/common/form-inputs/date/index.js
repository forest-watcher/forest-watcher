// @flow
import type { Question, Answer } from 'types/reports.types';

import React from 'react';
import { View, Text } from 'react-native';
import DatePicker from 'react-native-datepicker';
import i18n from 'i18next';

import styles from '../styles';
import dateStyles from './styles';

type Props = {
  question: Question,
  answer: Answer,
  onChange: Answer => void
};

function DateInput(props: Props) {
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
        <DatePicker
          style={dateStyles.datePicker}
          showIcon={false}
          date={props.answer.value}
          mode="datetime"
          format="MMMM Do YYYY, h:mm"
          placeholder={i18n.t('report.datePlaceholder')}
          cancelBtnText={i18n.t('commonText.cancel')}
          confirmBtnText={i18n.t('commonText.confirm')}
          onDateChange={handleChange}
          customStyles={{
            dateInput: dateStyles.dateInput,
            dateText: dateStyles.dateText
          }}
        />
      </View>
    </View>
  );
}

export default DateInput;
