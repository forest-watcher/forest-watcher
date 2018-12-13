// @flow
import type { Question, Answer } from 'types/reports.types';

import React, { Component } from 'react';
import i18n from 'locales';
import { Platform, View } from 'react-native';
import tracker from 'helpers/googleAnalytics';
import styles from 'components/form/styles';
import ActionButton from 'components/common/action-button';
import FormField from 'components/common/form-inputs';
import NextButton from 'components/form/next-button';
import withDraft from 'components/form/withDraft';
import { Navigation } from 'react-native-navigation';

type Props = {
  question: Question,
  questionAnswered: boolean,
  updateOnly: boolean,
  reportName: string,
  nextQuestionIndex: ?number,
  answer: Answer,
  text: string,
  setReportAnswer: (string, Answer, boolean) => void,
  componentId: string,
  editMode: boolean
};

const closeIcon = require('assets/close.png');

class Form extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('report.title')
        },
        leftButtons: [
          {
            id: 'backButton',
            text: i18n.t('commonText.cancel'),
            icon: Platform.select({
              android: closeIcon
            })
          }
        ]
      }
    };
  }

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentDidMount() {
    tracker.trackScreenView('Reporting - Form Step');

    Navigation.events().bindComponent(this);
  }

  /**
   * navigationButtonPressed - Handles events from the back button on the modal nav bar.
   *
   * @param  {type} { buttonId } The component ID for the button.
   */
  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'backButton') {
        Navigation.dismissModal(this.props.componentId);
      }
    }

  shouldComponentUpdate(nextProps) {
    return this.props.answer !== nextProps.answer;
  }

  onChange = answer => {
    const { setReportAnswer, reportName, updateOnly } = this.props;
    setReportAnswer(reportName, answer, updateOnly);
  };

  onSubmit = () => {
    const {
      componentId,
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
      Navigation.push(componentId, {
        component: {
          name: 'ForestWatcher.NewReport',
          passProps: {
            editMode,
            reportName,
            questionIndex: nextQuestionIndex
          }
        }
      });
    } else {
      if (editMode) {
        Navigation.pop(componentId);
      } else {
        Navigation.push(componentId, {
          component: {
            name: 'ForestWatcher.Answers',
            passProps: {
              reportName
            }
          }
        });
      }
    }
  };

  getNext(question, questionAnswered, text) {
    const disabled = question.required && !questionAnswered;
    const isBlob = question && question.type === 'blob';
    const Next = isBlob ? NextButton : ActionButton;
    const style = isBlob ? styles.buttonNextPos : styles.buttonPos;

    return <Next style={style} disabled={disabled} onPress={this.onSubmit} text={!isBlob && text} />;
  }

  render() {
    const { question, answer, questionAnswered, text } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.backgroundHack} />
        {question && <FormField question={question} answer={answer} onChange={this.onChange} />}
        {this.getNext(question, questionAnswered, text)}
      </View>
    );
  }
}

export default withDraft(Form);
