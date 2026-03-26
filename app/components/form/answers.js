// @flow
import type { Answer, Question } from 'types/reports.types';

import React, { PureComponent } from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import { Navigation } from 'react-native-navigation';
import i18n from 'i18next';

import ActionButton from 'components/common/action-button';
import AnswerComponent from 'components/form/answer/answer';
import ImageCarousel from 'components/common/image-carousel';
import withDraft from './withDraft';
import styles from './styles';
import displayExportReportDialog from 'helpers/sharing/displayExportReportDialog';
import { toFileUri } from 'helpers/fileURI';
import { trackReportingConcluded } from 'helpers/analytics';
import { isBlobResponse } from 'helpers/forms';

const deleteIcon = require('assets/delete_red.png');
const exportIcon = require('assets/upload.png');
import { deleteReportFile, listAnswerAttachments } from '../../helpers/report-store/reportFilePaths';

type Props = {
  componentId: string,
  metadata: Array<{ id: string, label: string, value: any }>,
  results: Array<{ question: Question, answer: Answer }>,
  reportName: string,
  uploadReport: () => void,
  deleteReport: () => void,
  exportReport: () => void,
  exportReportAsBundle: () => Promise<void>,
  setReportAnswer: (Answer, boolean) => void,
  readOnly: boolean,
  isConnected: boolean,
  showNotConnectedNotification: () => void,
  showExportReportsSuccessfulNotification: () => void,
  showUploadButton: boolean
};

type Image = {
  id: string,
  name: string,
  order: number,
  required: boolean,
  uri: any,
  index: number,
  answer: Answer
};

const closeIcon = require('assets/close.png');

class Answers extends PureComponent<Props> {
  static options(passProps: { readOnly: boolean }) {
    return {
      topBar: {
        leftButtons: [
          {
            id: 'backButton',
            text: i18n.t('commonText.cancel'),
            icon: Platform.select({
              android: closeIcon
            })
          }
        ],
        rightButtons: passProps.readOnly
          ? [
              {
                id: 'export',
                icon: exportIcon
              }
            ]
          : [],
        title: {
          text: i18n.t('report.review')
        }
      }
    };
  }

  /**
   * navigationButtonPressed - Handles events from the buttons on the modal nav bar.
   *
   * @param  {type} { buttonId } The component ID for the button.
   */
  async navigationButtonPressed({ buttonId }) {
    if (buttonId === 'export') {
      const buttonHandler = async idx => {
        switch (idx) {
          case 0: {
            await this.props.exportReportAsBundle();
            this.props.showExportReportsSuccessfulNotification();
            break;
          }
          case 1: {
            await this.props.exportReport();
            this.props.showExportReportsSuccessfulNotification();
            break;
          }
          case 2: {
            if (this.props.showUploadButton) {
              this.onUploadRequested();
            }
            break;
          }
        }
      };
      await displayExportReportDialog(this.props.showUploadButton, buttonHandler);
    }

    if (buttonId === 'backButton') {
      Navigation.dismissModal(this.props.componentId);
      trackReportingConcluded('cancelled', 'answers');
    }
  }

  onUploadRequested = () => {
    if (!this.props.isConnected) {
      this.props.showNotConnectedNotification();
      return;
    }

    const { uploadReport, componentId } = this.props;
    uploadReport();
    Navigation.dismissModal(componentId);
  };

  onPressSend = () => {
    const { uploadReport, componentId } = this.props;
    uploadReport();

    trackReportingConcluded('completed', 'overview');
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
          editMode: true,
          updateOnly: true,
          popToComponentId: this.props.componentId
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

  onDeleteImage = (id, questionName, images: Array<Image>) => {
    const image: ?Image = images.find(i => i.id === id);
    if (!image) {
      return;
    }
    const { setReportAnswer } = this.props;
    const found = images.findIndex(x => x.index === image.index) ?? -1;
    deleteReportFile(this.props.reportName, image.answer.questionName, 'image/jpeg', image.index);
    if (found >= 0) {
      const newList = image.answer.value;
      newList.splice(found, 1);
      const answer = {
        questionName,
        value: newList
      };
      setReportAnswer(answer, true);
      if (image.required && newList.length === 0) {
        this.onEdit(image?.order);
      }
    }
  };

  handleDeleteArea = () => {
    const { componentId, deleteReport } = this.props;
    deleteReport();
    trackReportingConcluded('cancelled', 'overview');
    Navigation.dismissModal(componentId);
  };

  render() {
    const { results, readOnly, metadata } = this.props;
    const regularAnswers = results.filter(({ question }) => question.type !== 'blob');
    const images = [];
    results.filter(isBlobResponse).forEach((image, index) => {
      const attachments = listAnswerAttachments(
        this.props.reportName,
        image.question.name,
        'image/jpeg',
        image.answer.value
      );

      attachments.forEach((path, index) => {
        images.push({
          id: `${image.question.name}-${image.answer.value[index].index}`,
          uri: toFileUri(path),
          name: image.question.name,
          order: image.question.order,
          required: image.question.required,
          index: image.answer.value[index].index,
          answer: image.answer
        });
      });
    });
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
