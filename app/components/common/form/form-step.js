import React, { Component } from 'react';
import { View } from 'react-native';
import { Field, reduxForm } from 'redux-form';

import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import getInputForm from 'components/common/form-inputs';
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
  constructor(props) {
    super();
    this.state = { viewPrepared: true };
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }
  onNavigatorEvent(event) {
    if (event.type === 'ScreenChangedEvent') {
      if (event.id === 'willDisappear') {
        this.setState({ viewPrepared: false });
      }
      if (event.id === 'didAppear') {
        this.setState({ viewPrepared: true });
      }
    }
  }
  render() {
    return this.state.viewPrepared ?
      (<View style={styles.container}>
        <View style={styles.container}>
          <Field
            name={this.props.question.name}
            component={getInputForm}
            question={this.props.question}
          />
        </View>
        {getNext(this.props.question, this.props.answer, this.props.next)}
      </View>) : null;
  }
}

FormStep.propTypes = {
  question: React.PropTypes.object.isRequired,
  answer: React.PropTypes.any,
  next: React.PropTypes.object.isRequired,
  navigator: React.PropTypes.object.isRequired
};

export default reduxForm({
  destroyOnUnmount: false
})(FormStep);
