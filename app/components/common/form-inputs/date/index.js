import React from 'react';
import PropTypes from 'prop-types';
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
          cancelBtnText={I18n.t('commonText.cancel')}
          confirmBtnText={I18n.t('commonText.confirm')}
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
  question: PropTypes.shape({
    label: PropTypes.string,
    defaultValue: PropTypes.string,
    values: PropTypes.array
  }).isRequired,
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired
};

export default DateInput;
