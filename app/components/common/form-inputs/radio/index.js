import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    <KeyboardAwareScrollView>
      <View style={styles.container}>
        <Text style={styles.label}>{props.question.label}</Text>
        <ScrollView
          style={styles.containerContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {
            props.question.values.map((item, index) => (
              <React.Fragment>
                <View style={styles.inputContainer} key="container">
                  <CheckBtn
                    key={index}
                    label={item.label}
                    checked={props.input.value === item.value}
                    onPress={() => handlePress(item.value)}
                  />
                </View>
                {childQuestions && childQuestions.length
                && childQuestions[0].conditionalValue === item.value &&
                  <TextInput
                    visible={props.input.value === item.value}
                    question={childQuestions[0]}
                  />
                }
              </React.Fragment>
            ))
          }
        </ScrollView>
      </View>
    </KeyboardAwareScrollView>
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
