// @flow
import type { Question } from 'types/reports.types';

import React, { Component } from 'react';
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
  answer: any,
  text: string,
  onSubmit: () => void,
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

  onSubmit = () => {
    const { onSubmit, navigator } = this.props;
    onSubmit();
    navigator.push('ForestWatcher.NewReport');
  };

  getNext(question, answer, text) {
    const disabled = !answer && question && question.required;
    const isBlob = question && question.type === 'blob';
    const Next = isBlob ? NextButton : ActionButton;
    const style = isBlob ? styles.buttonNextPos : styles.buttonPos;
    return null;
    // return (
    //   <Next
    //     style={style}
    //     disabled={disabled}
    //     onPress={this.onSubmit}
    //     text={!isBlob && text}
    //   />
    // );
  }

  render() {
    const { question, answer, text } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <View style={styles.backgroundHack} />
          {question && <FormField question={question} />}
        </View>
        {this.getNext(question, answer, text)}
      </View>
    );
  }
}

export default withDraft(Form);
