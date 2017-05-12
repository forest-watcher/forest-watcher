import React from 'react';
import { Alert, View } from 'react-native';
import { Field, reduxForm } from 'redux-form';

import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import getInputForm from 'components/common/form-inputs';
import NextButton from './next-button';
import styles from './styles';

const onPressNext = (cb) => {
  if (!cb()) {
    Alert.alert(
      I18n.t('report.unable'),
      I18n.t('report.connectionRequired'),
      [{ text: 'OK' }]
    );
  }
};

const getNext = (question, answer, next) => {
  const disabled = !answer && question.required;
  const isBlob = question.type === 'blob';

  if (isBlob) {
    return (<NextButton transparent={!answer} style={styles.buttonNextPos} disabled={disabled} onPress={next.callback} />);
  }
  return (<ActionButton
    style={styles.buttonPos}
    disabled={disabled}
    onPress={() => onPressNext(next.callback)}
    text={I18n.t(next.text)}
  />);
};

const FormStep = ({ question, answer, next }) => (
  <View style={styles.container}>
    <View style={styles.container}>
      <Field
        name={question.name}
        component={getInputForm}
        question={question}
      />
    </View>
    {getNext(question, answer, next)}
  </View>
);

FormStep.propTypes = {
  question: React.PropTypes.object.isRequired,
  answer: React.PropTypes.any,
  next: React.PropTypes.object.isRequired
};

export default reduxForm({
  destroyOnUnmount: false
})(FormStep);
