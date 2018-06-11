// @flow
import type { Answer, Question } from 'types/reports.types';

import React, { PureComponent } from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native';
import Theme from 'config/theme';
import i18n from 'locales';

import ActionButton from 'components/common/action-button';
import AnswerComponent from 'components/form/answer/answer';
import ImageCarousel from 'components/common/image-carousel';
import withDraft from './withDraft';
import styles from './styles';

const deleteIcon = require('assets/delete_red.png');
const uploadIcon = require('assets/upload.png');

type Props = {
  navigator: any,
  results: Array<{ question: Question, answers: Array<string> }>,
  reportName: string,
  uploadReport: (string) => void,
  setReportAnswer: (string, Answer, boolean) => void,
  readOnly: boolean,
  setActiveAlerts: boolean => void
};

class Answers extends PureComponent<Props> {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  constructor(props) {
    super(props);
    if (props.showUploadButton) {
      props.navigator.setButtons({
        rightButtons: [{ icon: uploadIcon, id: 'upload' }]
      });
      props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
    }
  }

  onNavigatorEvent = (event) => {
    const { reportName, uploadReport } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'upload') uploadReport(reportName);
    }
  };

  onPressSave = () => {
    const { reportName, uploadReport, navigator, setActiveAlerts } = this.props;
    uploadReport(reportName);
    setActiveAlerts(true);
    navigator.popToRoot({ animate: true });
  }

  onEdit = (index) => {
    const { navigator, reportName } = this.props;
    const screen = 'ForestWatcher.NewReport';
    const disableDraft = false;
    navigator.showModal({
      screen,
      backButtonHidden: true,
      passProps: {
        reportName,
        title: i18n.t('report.title'),
        questionIndex: index,
        disableDraft,
        editMode: true
      }
    });
  }

  onDeleteImage = (id, questionName, images) => {
    const image = images.find(i => i.id === id);
    const { reportName, setReportAnswer } = this.props;
    const answer = {
      questionName,
      value: ''
    };
    setReportAnswer(reportName, answer, true);
    if (image.required) this.onEdit(image.questionNumber);
  }

  render() {
    const { results, readOnly } = this.props;
    const regularAnswers = results.filter(({ question }) => question.type !== 'blob');
    const images = results.filter(({ question }) => question.type === 'blob')
      .map((image, index) => ({
        id: image.question.Id,
        uri: image.answers[index],
        name: image.question.name,
        questionNumber: image.question.questionNumber,
        required: image.question.required
      }));
    const imageActions = !readOnly ? [{
      callback: (id, name) => this.onDeleteImage(id, name, images),
      icon: deleteIcon
    }] : null;
    return (
      <View style={styles.answersContainer}>
        <ScrollView>
          {
            regularAnswers.map((result) => (
              <AnswerComponent
                id={result.question.Id}
                key={result.question.Id}
                answers={result.answers}
                question={result.question.label}
                onEditPress={() => this.onEdit(result.question.questionNumber)}
                readOnly={readOnly}
              />
            ))
          }
          {images.length > 0 &&
            <View style={styles.picturesContainer}>
              <Text style={styles.answersText}>{i18n.t('report.pictures')}</Text>
              <ImageCarousel
                images={images}
                actions={imageActions}
                add={this.onEdit}
                readOnly={readOnly}
              />
            </View>
          }
          {!readOnly &&
          <View style={styles.buttonSaveContainer}>
            <ActionButton
              onPress={this.onPressSave}
              text={i18n.t('commonText.save')}
            />
          </View>
          }
        </ScrollView>
      </View>
    );
  }
}

export default withDraft(Answers);
