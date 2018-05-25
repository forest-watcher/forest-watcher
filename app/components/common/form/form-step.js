import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { Field, reduxForm } from 'redux-form';

import ActionButton from 'components/common/action-button';
import getInputForm from 'components/common/form-inputs';
import withDraft from './withDraft';
import NextButton from './next-button';
import styles from './styles';

const getNext = (question, hasAnswer, next) => {
  const disabled = !hasAnswer && question && question.required;
  const isBlob = question && question.type === 'blob';

  if (isBlob) {
    return (<NextButton transparent={disabled} style={styles.buttonNextPos} disabled={disabled} onPress={next.callback} />);
  }
  return (<ActionButton
    style={styles.buttonPos}
    disabled={disabled}
    onPress={next.callback}
    text={next.text}
  />);
};

class FormStep extends Component { // eslint-disable-line

  static propTypes = {
    question: PropTypes.object.isRequired,
    hasAnswer: PropTypes.any,
    next: PropTypes.object.isRequired,
    navigator: PropTypes.object.isRequired
  };

  render() {
    const { question, hasAnswer, next, navigator } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.backgroundHack} />
          {question &&
            <Field
              name={question.name}
              component={getInputForm}
              question={question}
              navigator={navigator}
            />
          }
        </View>
        {getNext(question, hasAnswer, next)}
      </View>
    );
  }
}

export default reduxForm({
  destroyOnUnmount: false
})(withDraft(FormStep));
