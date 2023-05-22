// @flow
import type { Question, Answer, Template } from 'types/reports.types';

import React, { Component } from 'react';
import i18n from 'i18next';
import { Platform, View } from 'react-native';
import debounceUI from 'helpers/debounceUI';
import { trackScreenView, trackReportingConcluded } from 'helpers/analytics';
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
  editMode: boolean,
  /**
   * The component Id to pop to if in edit mode
   */
  popToComponentId: string,
  template: Template,
  isModal: Boolean
};

const closeIcon = require('assets/backButton.png');

class Form extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('report.title')
        },
        leftButtons: passProps.editMode
          ? []
          : [
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

  componentDidMount() {
    trackScreenView('Reporting - Form Step');
  }

  /**
   * navigationButtonPressed - Handles events from the back button on the modal nav bar.
   *
   * @param  {type} { buttonId } The component ID for the button.
   */
  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'backButton') {
      if (this.props.isModal) {
        Navigation.dismissModal(this.props.componentId);
      } else {
        Navigation.pop(this.props.componentId);
        trackReportingConcluded('cancelled', 'answers');
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.answer !== nextProps.answer;
  }

  onChange = answer => {
    const { setReportAnswer, reportName, updateOnly } = this.props;
    setReportAnswer(reportName, answer, updateOnly);
  };

  onSubmit = debounceUI(() => {
    const {
      componentId,
      reportName,
      nextQuestionIndex,
      answer,
      setReportAnswer,
      updateOnly,
      editMode,
      questionAnswered,
      popToComponentId
    } = this.props;
    if (!questionAnswered) {
      setReportAnswer(reportName, answer, updateOnly);
    }
    if (editMode) {
      Navigation.popTo(popToComponentId);
    } else if (nextQuestionIndex !== null) {
      Navigation.push(componentId, {
        component: {
          name: 'ForestWatcher.NewReport',
          passProps: {
            editMode,
            reportName,
            questionIndex: nextQuestionIndex,
            template: this.props.template
          }
        }
      });
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
  });

  getNext(question, questionAnswered, text) {
    const disabled = question.required && !questionAnswered;
    const isBlob = question && question.type === 'blob';
    const isAudio = question && question.type === 'audio';
    const Next = isBlob || (isAudio && !questionAnswered) ? NextButton : ActionButton;
    const style = isBlob || (isAudio && !questionAnswered) ? styles.buttonNextPos : styles.buttonPos;

    return <Next style={style} disabled={disabled} onPress={this.onSubmit} text={!isBlob && text} />;
  }

  render() {
    const { question, answer, reportName, questionAnswered, text } = this.props;
    return (
      <View style={styles.container}>
        {question && <FormField reportName={reportName} question={question} answer={answer} onChange={this.onChange} />}
        {this.getNext(question, questionAnswered, text)}
      </View>
    );
  }
}

export default withDraft(Form);
