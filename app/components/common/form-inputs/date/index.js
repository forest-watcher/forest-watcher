import React from 'react';
import {
  View,
  Text
} from 'react-native';
import DatePicker from 'react-native-datepicker';
import I18n from 'locales';

import styles from '../styles';
import dateStyles from './styles';

function DateInput(props) {
  function handlePress(date) {
    props.input.onChange(date);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      <View style={styles.inputContainer}>
        <DatePicker
          style={dateStyles.datePicker}
          showIcon={false}
          date={props.input.value}
          mode="datetime"
          format="MMMM Do YYYY, h:mm"
          placeholder={I18n.t('report.datePlaceholder')}
          cancelBtnText={I18n.t('common.cancel')}
          confirmBtnText={I18n.t('common.confirm')}
          onDateChange={handlePress}
          customStyles={{
            dateInput: dateStyles.dateInput,
            dateText: dateStyles.dateText
          }}
        />
      </View>
    </View>
  );
}

DateInput.propTypes = {
  question: React.PropTypes.shape({
    label: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    values: React.PropTypes.array
  }).isRequired,
  input: React.PropTypes.shape({
    onBlur: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  }).isRequired,
  meta: React.PropTypes.shape({
    active: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    invalid: React.PropTypes.bool.isRequired,
    pristine: React.PropTypes.bool.isRequired,
    visited: React.PropTypes.bool.isRequired
  }).isRequired
};

export default DateInput;
