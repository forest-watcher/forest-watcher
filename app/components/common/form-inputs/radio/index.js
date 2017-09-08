import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import { Field } from 'redux-form';

import CheckBtn from 'components/common/form-inputs/check-btn';
import TextInput from '../text-detail';
import styles from '../styles';

function RadioInput(props) {
  function handlePress(value) {
    if (value !== props.input.value) {
      props.input.onChange(value);
    }
  }
  const { childQuestions } = props.question;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      {props.question.values.map((item, index) => {
        let conditionalField = null;
        if (childQuestions && childQuestions.length && childQuestions[0].conditionalValue === item.value) {
          const visible = props.input.value === item.value;
          conditionalField = (
            <Field
              visible={visible}
              name={childQuestions[0].name}
              component={TextInput}
              question={childQuestions[0]}
            />
          );
        }
        return [
          <View style={styles.inputContainer}>
            <CheckBtn
              key={index}
              label={item.label}
              checked={props.input.value === item.value}
              onPress={() => handlePress(item.value)}
            />
          </View>,
          conditionalField
        ];
      })}
    </View>
  );
}

RadioInput.propTypes = {
  question: PropTypes.shape({
    label: PropTypes.string,
    defaultValue: PropTypes.number,
    values: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.number.isRequired,
        label: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired
};

export default RadioInput;
