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
            props.question.values.map((item, index) => {
              const checked = props.input.value.indexOf(item.value) >= 0;
              const { childQuestions } = props.question;
              return (
                <React.Fragment>
                  <View style={styles.inputContainer}>
                    <CheckBtn
                      key={index}
                      label={item.label}
                      checked={checked}
                      onPress={() => handlePress(item.value)}
                    />
                  </View>
                  {childQuestions && childQuestions.length
                    && childQuestions[0].conditionalValue === item.value &&
                    <TextInput
                      visible={checked}
                      question={childQuestions[0]}
                    />
                  }
                </React.Fragment>
              );
            })
          }
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
  input: PropTypes.shape({ // eslint-disable-line
    onChange: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired
};

export default SelectInput;
