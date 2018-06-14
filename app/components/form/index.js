// @flow
import type { Question, Answer } from 'types/reports.types';

import React, { Component } from 'react';
import i18n from 'locales';
import { View } from 'react-native';
import Theme from 'config/theme';
import tracker from 'helpers/googleAnalytics';
import styles from 'components/form/styles';
import ActionButton from 'components/common/action-button';
import FormField from 'components/common/form-inputs';
import NextButton from 'components/form/next-button';
import withDraft from 'components/form/withDraft';

type Props = {
  question: Question,
  questionAnswered: boolean,
  updateOnly: boolean,
  reportName: string,
  nextQuestionIndex: ?number,
  answer: Answer,
  text: string,
  setReportAnswer: (string, Answer, boolean) => void,
  navigator: any,
  questionIndex: ?number,
  editMode: boolean
};

class Form extends Component<Props> {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  componentDidMount() {
    tracker.trackScreenView('Reporting - Form Step');
  }

  shouldComponentUpdate(nextProps) {
    return this.props.answer !== nextProps.answer;
  }

  onChange = (answer) => {
    const { setReportAnswer, reportName, updateOnly } = this.props;
    setReportAnswer(reportName, answer, updateOnly);
  };

  onSubmit = () => {
    const {
      navigator,
      reportName,
      nextQuestionIndex,
      answer,
      setReportAnswer,
      updateOnly,
      editMode,
      questionAnswered
    } = this.props;
    if (!questionAnswered) {
      setReportAnswer(reportName, answer, updateOnly);
    }
    if (nextQuestionIndex !== null) {
      navigator.push({
        screen: 'ForestWatcher.NewReport',
        title: i18n.t('report.title'),
        passProps: {
          editMode,
          reportName,
          questionIndex: nextQuestionIndex
        }
      });
    } else {
      if (editMode) {
        navigator.popToRoot({ animated: false });
        navigator.push({
          animated: false,
          screen: 'ForestWatcher.Reports',
          title: i18n.t('dashboard.myReports')
        });
      }
      navigator.push({
        screen: 'ForestWatcher.Answers',
        title: i18n.t('report.review'),
        passProps: {
          reportName
        }
      });
    }
  };

  getNext(question, questionAnswered, text) {
    const disabled = question.required && !questionAnswered;
    const isBlob = question && question.type === 'blob';
    const Next = isBlob ? NextButton : ActionButton;
    const style = isBlob ? styles.buttonNextPos : styles.buttonPos;

    return (
      <Next
        style={style}
        disabled={disabled}
        onPress={this.onSubmit}
        text={!isBlob && text}
      />
    );
  }

  render() {
    const { question, answer, questionAnswered, text } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.backgroundHack} />
        {question && (
          <FormField
            question={question}
            answer={answer}
            onChange={this.onChange}
          />
        )}
        {this.getNext(question, questionAnswered, text)}
      </View>
    );
  }
}

export default withDraft(Form);
