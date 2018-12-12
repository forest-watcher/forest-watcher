// @flow
import type { Answer, Question } from 'types/reports.types';

import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';
import i18n from 'locales';

import ActionButton from 'components/common/action-button';
import AnswerComponent from 'components/form/answer/answer';
import ImageCarousel from 'components/common/image-carousel';
import withDraft from './withDraft';
import styles from './styles';
import { Navigation } from 'react-native-navigation';

const deleteIcon = require('assets/delete_red.png');
const uploadIcon = require('assets/upload.png');

type Props = {
  componentId: string,
  metadata: Array<{ id: string, label: string, value: any }>,
  results: Array<{ question: Question, answer: Answer }>,
  reportName: string,
  uploadReport: string => void,
  deleteReport: string => void,
  setReportAnswer: (string, Answer, boolean) => void,
  readOnly: boolean,
  setActiveAlerts: boolean => void
};

class Answers extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        leftButtons: [
          {
            id: 'backButton',
            text: i18n.t('commonText.cancel')
          }
        ],
        rightButtons: passProps.showUploadButton
          ? [
              {
                id: 'upload',
                icon: uploadIcon
              }
            ]
          : [],
        title: {
          text: i18n.t('report.review')
        }
      }
    };
  }

  constructor(props) {
    super(props);

    Navigation.events().bindComponent(this);
  }

  /**
   * navigationButtonPressed - Handles events from the buttons on the modal nav bar.
   *
   * @param  {type} { buttonId } The component ID for the button.
   */
  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'upload') {
      const { reportName, uploadReport } = this.props;
      uploadReport(reportName);
    }

    if (buttonId === 'backButton') {
      Navigation.dismissModal(this.props.componentId);
    }
  }

  onPressSend = () => {
    const { reportName, uploadReport, componentId, setActiveAlerts } = this.props;
    uploadReport(reportName);
    setActiveAlerts(true);
    Navigation.dismissModal(componentId);
  };

  onEdit = index => {
    const { reportName } = this.props;
    const screen = 'ForestWatcher.NewReport';
    Navigation.push(this.props.componentId, {
      component: {
        name: screen,
        passProps: {
          reportName,
          title: i18n.t('report.title'),
          questionIndex: index,
          readOnly: false,
          editMode: true
        },
        options: {
          topBar: {
            backButton: {
              visible: false
            }
          }
        }
      }
    });
  };

  onDeleteImage = (id, questionName, images) => {
    const image = images.find(i => i.id === id);
    const { reportName, setReportAnswer } = this.props;
    const answer = {
      questionName,
      value: ''
    };
    setReportAnswer(reportName, answer, true);
    if (image.required) this.onEdit(image.order);
  };

  handleDeleteArea = () => {
    const { componentId, deleteReport, reportName } = this.props;
    deleteReport(reportName);
    Navigation.dismissModal(componentId);
  };

  render() {
    const { results, readOnly, metadata } = this.props;
    const regularAnswers = results.filter(({ question }) => question.type !== 'blob');
    const images = results
      .filter(({ question }) => question.type === 'blob')
      .map((image, index) => ({
        id: image.question.Id,
        uri: image.answer.value[index],
        name: image.question.name,
        order: image.question.order,
        required: image.question.required
      }));
    const imageActions = !readOnly
      ? [
          {
            callback: (id, name) => this.onDeleteImage(id, name, images),
            icon: deleteIcon
          }
        ]
      : null;

    return (
      <View style={styles.answersContainer}>
        <ScrollView>
          {metadata && !!metadata.length && (
            <View style={[styles.listContainer, styles.listContainerFirst]}>
              <Text style={styles.listTitle}>{i18n.t('report.metadata')}</Text>
              {metadata.map(meta => (
                <AnswerComponent
                  questionId={meta.id}
                  key={meta.id}
                  answers={meta.value}
                  question={meta.label}
                  readOnly
                />
              ))}
            </View>
          )}
          {regularAnswers && !!regularAnswers.length && (
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>{i18n.t('report.answers')}</Text>
              {regularAnswers.map(result => (
                <AnswerComponent
                  questionId={result.question.Id}
                  key={result.question.Id}
                  answers={result.answer.value}
                  question={result.question.label}
                  onEditPress={() => this.onEdit(result.question.order)}
                  readOnly={readOnly}
                />
              ))}
            </View>
          )}
          {images.length > 0 && (
            <View style={styles.picturesContainer}>
              <Text style={styles.answersText}>{i18n.t('report.pictures')}</Text>
              <ImageCarousel images={images} actions={imageActions} add={this.onEdit} readOnly={readOnly} />
            </View>
          )}
          <View style={styles.buttonsContainer}>
            {!readOnly && (
              <ActionButton style={styles.actionBtn} onPress={this.onPressSend} text={i18n.t('commonText.send')} />
            )}
            <ActionButton
              delete
              style={styles.actionBtn}
              onPress={this.handleDeleteArea}
              text={i18n.t('report.delete')}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default withDraft(Answers);
