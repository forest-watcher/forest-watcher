import React, { Component } from 'react';
import {
  View
} from 'react-native';
import { Field, reduxForm } from 'redux-form';
import { withNavigation } from 'react-navigation';

import I18n from 'locales';
import StepsSlider from 'components/common/steps-slider';
import getInputForm from 'components/common/form-inputs';
import ActionButton from 'components/common/action-button';
import Header from './header';
import styles from '../styles';

function isEmptyAnswer(answer) {
  if (!answer) return true;
  switch (answer.constructor) {
    case Array:
      return answer.length <= 0;
    case String:
      return answer === '';
    case Object:
      return Object.keys(answer) <= 0;
    default:
      return true;
  }
}

function getBtnTextByType(type) {
  switch (type) {
    case 'text':
      return I18n.t('report.inputText');
    case 'radio':
      return I18n.t('report.inputRadio');
    case 'select':
      return I18n.t('report.inputSelect');
    default:
      return I18n.t('report.input');
  }
}

function getBtnTextByPosition(position, total) {
  return position < total
    ? 'Next'
    : 'Save';
}

class ReportsForm extends Component {
  constructor() {
    super();

    this.state = {
      page: 0
    };
    // First 4 questions in the form should be auto filled
    this.questionsToSkip = 4;
  }

  componentWillMount() {
    this.props.getQuestions();
  }

  handleBack = () => {
    if (this.state.page > 0) {
      this.setState({
        page: this.prevPage
      });
    } else {
      this.props.navigation.goBack();
    }
  }

  goToNextPage = () => {
    const { questions, answers } = this.props;
    const currentQuestion = this.state.page + this.questionsToSkip;
    let next = 1;
    if (currentQuestion < questions.length - 1) {
      for (let i = currentQuestion + 1, qLength = questions.length; i < qLength; i++) {
        const nextConditions = questions[i].conditions;
        const nexthasConditions = nextConditions && nextConditions.length > 0;
        if (!nexthasConditions || (answers[nextConditions[0].name] === nextConditions[0].value)) {
          this.jumptToPage(next);
          break;
        } else {
          next += 1;
        }
      }
    } else {
      this.props.saveReport(this.props.answers);
      this.props.navigation.goBack();
    }
  }

  jumptToPage(jump) {
    this.prevPage = this.state.page;
    this.setState((prevState) => ({
      page: prevState.page + jump
    }));
  }

  render() {
    const { questions, answers } = this.props;
    if (!questions || !questions.length) return null;

    const questionNumber = this.state.page + this.questionsToSkip;
    const question = questions[questionNumber];
    const answer = answers && answers[question.name];
    const disabled = isEmptyAnswer(answer) && question.required;
    const btnText = disabled ? getBtnTextByType(question.type) : getBtnTextByPosition(questionNumber, questions.length - 1);
    return (
      <View style={styles.container}>
        <Header
          title={I18n.t('commonText.setUp')}
          onBackPress={this.handleBack}
        />
        <StepsSlider
          style={styles.containerFloat}
          page={this.state.page}
          onChangeTab={this.updatePage}
        >
          {questions.map((item, index) => {
            if (index < this.questionsToSkip) return null;
            return (
              <View style={styles.container} key={index}>
                <Field
                  name={item.name} // eslint-disable-line
                  component={getInputForm}
                  question={item}
                />
              </View>
            );
          })}
        </StepsSlider>
        <ActionButton style={styles.buttonPos} disabled={disabled} onPress={this.goToNextPage} text={btnText} />
      </View>
    );
  }
}

ReportsForm.propTypes = {
  saveReport: React.PropTypes.func.isRequired,
  getQuestions: React.PropTypes.func.isRequired,
  questions: React.PropTypes.array.isRequired,
  answers: React.PropTypes.object.isRequired,
  navigation: React.PropTypes.object.isRequired
};

export default reduxForm({
  destroyOnUnmount: false
})(withNavigation(ReportsForm));
