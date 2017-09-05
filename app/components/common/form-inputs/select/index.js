import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import { Field } from 'redux-form';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>{props.question.label}</Text>
        <ScrollView
          style={styles.containerContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {props.question.values.map((item, index) => {
            const checked = props.input.value.indexOf(item.value) >= 0;
            let conditionalField = null;
            if (childQuestions && childQuestions.length > 0) {
              childQuestions.forEach(childConditional => {
                if (item.value === childConditional.conditionalValue) {
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
              <View style={styles.inputContainer}>
                <CheckBtn
                  key={index}
                  label={item.label}
                  checked={checked}
                  onPress={() => handlePress(item.value)}
                />
              </View>,
              conditionalField
            ];
          })}
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
  );
}

SelectInput.propTypes = {
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

export default SelectInput;
