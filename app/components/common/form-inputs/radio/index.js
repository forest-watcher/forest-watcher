import React from 'react';
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
      {props.question.values.map((value, index) => {
        let conditionalField = null;
        if (childQuestions && childQuestions.length) {
          if (props.input.value === value && childQuestions[0] && childQuestions[0].conditionalValue === props.input.value) {
            conditionalField = (
              <Field
                name={childQuestions[0].name}
                component={TextInput}
                question={childQuestions[0]}
              />
            );
          }
        }
        return [
          <CheckBtn
            key={index}
            value={value}
            checked={props.input.value === value}
            onPress={() => handlePress(value)}
          />,
          conditionalField
        ];
      })}
    </View>
  );
}

RadioInput.propTypes = {
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

export default RadioInput;
