import React, { Component } from 'react';
import {
  View,
  ActivityIndicator
} from 'react-native';
import { Field, reduxForm } from 'redux-form';
import { withNavigation } from 'react-navigation';
import { getLanguage } from 'helpers/language';

import I18n from 'locales';
import Theme from 'config/theme';
import StepsSlider from 'components/common/steps-slider';
import getInputForm from 'components/common/form-inputs';
import ActionButton from 'components/common/action-button';
import Header from './header';
import NextButton from './next-button';
import styles from './styles';

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

function renderLoading() {
  return (
    <View style={[styles.container, styles.containerCenter]}>
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size={'large'}
      />
    </View>
  );
}

class FeedBackForm extends Component {
  constructor() {
    super();

    this.state = {
      page: 0
    };
    this.questionsToSkip = 0;
    this.pageHistory = [];
  }

  componentWillMount() {
    if ((this.props.questions && !this.props.questions.length) || this.isDifferentLanguage()) {
      this.props.getQuestions(this.props.feedback);
    }
  }

  isDifferentLanguage() {
    return this.props.reportLanguage !== getLanguage().toUpperCase();
  }

  handleBack = () => {
    if (this.state.page > 0) {
      const prevPage = this.pageHistory[this.pageHistory.length - 1];
      if (prevPage >= 0) {
        this.setState({
          page: this.pageHistory[this.pageHistory.length - 1]
        });
        this.pageHistory.pop();
      }
      this.prevPag = this.prevPage - 1;
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
      const { state } = this.props.navigation;
      const feedback = state && state.params && state.params.feedback;
      this.props.finishFeedback(feedback);
      this.props.navigation.goBack();
    }
  }

  jumptToPage(jump) {
    this.pageHistory.push(this.state.page);
    this.setState((prevState) => ({
      page: prevState.page + jump
    }));
  }

  render() {
    const { questions, answers } = this.props;
    if (!questions || !questions.length) return renderLoading();

    const questionNumber = this.state.page + this.questionsToSkip;
    const question = questions[questionNumber];
    const isImageInput = question.type === 'blob';
    const answer = answers && answers[question.name];
    const emptyAnswer = isEmptyAnswer(answer);
    const disabled = emptyAnswer && question.required;
    const btnText = disabled ? getBtnTextByType(question.type) : getBtnTextByPosition(questionNumber, questions.length - 1);
    return (
      <View style={styles.container}>
        <Header
          light={isImageInput && emptyAnswer}
          title={isImageInput && emptyAnswer ? I18n.t('report.takePicture') : I18n.t('report.title')}
          onBackPress={this.handleBack}
        />
        <StepsSlider
          style={isImageInput && emptyAnswer ? styles.containerFull : styles.containerFloat}
          page={this.state.page}
          hideIndex={isImageInput && emptyAnswer}
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
        {isImageInput
          ? <NextButton transparent={emptyAnswer} style={styles.buttonNextPos} disabled={disabled} onPress={this.goToNextPage} />
          : <ActionButton style={styles.buttonPos} disabled={disabled} onPress={this.goToNextPage} text={btnText} />
        }
      </View>
    );
  }
}

FeedBackForm.propTypes = {
  finishFeedback: React.PropTypes.func.isRequired,
  getQuestions: React.PropTypes.func.isRequired,
  reportLanguage: React.PropTypes.string.isRequired,
  feedback: React.PropTypes.string.isRequired,
  questions: React.PropTypes.array.isRequired,
  answers: React.PropTypes.object.isRequired,
  navigation: React.PropTypes.object.isRequired
};

export default reduxForm({
  destroyOnUnmount: false
})(withNavigation(FeedBackForm));
