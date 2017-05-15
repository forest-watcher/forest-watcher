import React from 'react';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import { Field } from 'redux-form';

import CheckBtn from 'components/common/form-inputs/check-btn';
import TextInput from '../text-detail';
import styles from '../styles';


function SelectInput(props) {
  function handlePress(value) {
    const newVal = [...props.input.value];
    const index = newVal.indexOf(value);
    if (index >= 0) {
      newVal.splice(index, 1);
    } else {
      newVal.push(value);
    }
    props.input.onChange(newVal);
  }
  const { childQuestions } = props.question;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.question.label}</Text>
      <ScrollView
        style={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {props.question.values.map((value, index) => {
          const checked = props.input.value.indexOf(value) >= 0;
          let conditionalField = null;
          if (childQuestions && childQuestions.length > 0) {
            childQuestions.forEach(childConditional => {
              if (value === childConditional.conditionalValue) {
                conditionalField = (
                  <Field
                    visible={checked}
                    name={childConditional.name}
                    component={TextInput}
                    question={childConditional}
                  />
                );
              }
            });
          }
          return [
            <CheckBtn
              key={index}
              value={value}
              checked={checked}
              onPress={() => handlePress(value)}
            />,
            conditionalField
          ];
        })}
      </ScrollView>
    </View>
  );
}

SelectInput.propTypes = {
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
  }).isRequired
};

export default SelectInput;
