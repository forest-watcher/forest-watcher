import React, { Component } from 'react';
import { View } from 'react-native';
import { Field, reduxForm } from 'redux-form';

import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import getInputForm from 'components/common/form-inputs';
import withDraft from './withDraft';
import NextButton from './next-button';
import styles from './styles';

const getNext = (question, answer, next) => {
  const disabled = !answer && question.required;
  const isBlob = question.type === 'blob';

  if (isBlob) {
    return (<NextButton transparent={!answer} style={styles.buttonNextPos} disabled={disabled} onPress={next.callback} />);
  }
  return (<ActionButton
    style={styles.buttonPos}
    disabled={disabled}
    onPress={next.callback}
    text={I18n.t(next.text)}
  />);
};

class FormStep extends Component {

  static propTypes = {
    question: React.PropTypes.object.isRequired,
    answer: React.PropTypes.any,
    next: React.PropTypes.object.isRequired,
    navigator: React.PropTypes.object.isRequired
  };

  render() {
    const { question, answer, next, navigator } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <Field
            name={question.name}
            component={getInputForm}
            question={question}
            navigator={navigator}
          />
        </View>
        {getNext(question, answer, next)}
      </View>
    );
  }
}

export default reduxForm({
  destroyOnUnmount: false
})(withDraft(FormStep));
