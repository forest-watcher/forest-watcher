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
  reportName: string,
  nextQuestionIndex: ?number,
  answer: Answer,
  text: string,
  setReportAnswer: (string, Answer) => void,
  navigator: any
};

class Form extends Component<Props> {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  componentDidMount() {
    tracker.trackScreenView('Reports');
  }

  onChange = (value) => {
    const { setReportAnswer, answer, reportName } = this.props;
    setReportAnswer(reportName, { ...answer, value });
  }

  onSubmit = () => {
    const { navigator, reportName, nextQuestionIndex } = this.props;
    if (nextQuestionIndex !== null) {
      navigator.push({
        screen: 'ForestWatcher.NewReport',
        title: i18n.t('report.title'),
        passProps: {
          reportName,
          questionIndex: nextQuestionIndex
        }
      });
    } else {
      navigator.push({
        screen: 'ForestWatcher.Answers',
        title: i18n.t('report.reports'),
        passProps: {
          reportName
        }
      });
    }
  };

  getNext(question, answer, text) {
    const disabled = !answer && question && question.required;
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
    const { question, answer, text } = this.props;
    const input = {
      value: this.props.answer.value,
      onChange: this.onChange
    };
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.backgroundHack} />
          {question && <FormField question={question} input={input} />}
        </View>
        {this.getNext(question, answer, text)}
      </View>
    );
  }
}

export default withDraft(Form);
