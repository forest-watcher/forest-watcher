// @flow
import type { Answer } from 'types/reports.types';

import React, { Component } from 'react';
import { Text, View, Image, TouchableHighlight, Alert, ScrollView } from 'react-native';
import Config from 'react-native-config';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import ImageCard from 'components/common/image-card';
import i18n from 'i18next';
import Theme from 'config/theme';

import styles from './styles';

import { storeReportFiles } from 'helpers/report-store/storeReportFiles';
import { toFileUri } from 'helpers/fileURI';
import { REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT } from 'helpers/forms';

const cameraAddIcon = require('assets/camera_add.png');
const deleteIcon = require('assets/delete_red.png');
import { deleteReportFile, listAnswerAttachments } from '../../../../helpers/report-store/reportFilePaths';
import type { Question } from '../../../../types/reports.types';

type Props = {
  answer: Answer,
  onChange: Answer => void,
  reportName: string,
  question: Question
};

type State = {
  cachebuster: ?string // We append a cachebusting part to the image uri or if it's replaced RN Image doesn't notice
};

class ImageBlobInput extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      cachebuster: null
    };
  }

  /**
   * launchCamera - when called, launches the platform specific UI to ask for a photo.
   * This photo can be taken while the app is running, or can be fetched from the library.
   * If the user does not want to continue, they can also press cancel.
   */
  addImage: (camera: boolean) => void = camera => {
    const options = {
      mediaType: 'photo',
      noData: true,
      quality: 0.7,
      cancelButtonTitle: i18n.t('chooseImage.cancel'),
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
        path: Config.APP_NAME,
        cameraRoll: true,
        privateDirectory: true
      }
    };

    const imageFun = camera ? launchCamera : launchImageLibrary;

    imageFun(options, async response => {
      const file = response.assets[0];
      if (file.fileSize > 5000000) {
        Alert.alert(i18n.t('report.fileTooSizeErrorTitle'), i18n.t('report.fileTooSizeErrorMessage'));
      } else if (file.error) {
        Alert.alert(i18n.t('commonText.error'), file.error, [{ text: 'OK' }]);
      } else if (file.uri) {
        // Don't store the exact URI against the answer because this breaks when we share the report.
        // Instead just store a value to indicate that there is an attachment present
        const index = new Date().getTime();
        this.handlePress({
          type: REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT,
          index
        });
        await storeReportFiles([
          {
            reportName: this.props.reportName,
            questionName: this.props.answer.questionName,
            type: 'image/jpeg',
            path: decodeURI(file.uri),
            size: file.fileSize,
            index
          }
        ]);
        this.setState({
          cachebuster: `t${Date.now()}`
        });
      }
    });
  };

  handlePress: (value: ?any) => void = (value: ?string) => {
    const { answer, onChange } = this.props;
    if (value !== answer.value) {
      onChange({
        ...answer,
        value: [...answer.value, value]
      });
    }
  };

  removePicture: (index: number) => Promise<void> = async index => {
    await deleteReportFile(this.props.reportName, this.props.answer.questionName, 'image/jpeg', index);
    const found = this.props.answer.value.findIndex(x => x.index === index);
    if (found >= 0) {
      const newList = this.props.answer.value;
      newList.splice(found, 1);
      this.props.onChange({ ...this.props.answer, value: newList });
    }
    this.setState({
      cachebuster: null
    });
  };

  render(): React$Element<any> {
    const images = listAnswerAttachments(
      this.props.reportName,
      this.props.answer.questionName,
      'image/jpeg',
      this.props.answer?.value || []
    );

    return (
      <View style={styles.container}>
        {images.length > 0 ? (
          <ScrollView contentContainerStyle={{ paddingBottom: 52 + 64 }}>
            {images.map((image, index) => (
              <View style={styles.preview} key={index}>
                <ImageCard
                  id={'imagePreview'}
                  name={'imagePreview'}
                  actions={[
                    {
                      callback: () => this.removePicture(this.props.answer?.value[index].index),
                      icon: deleteIcon
                    }
                  ]}
                  uri={toFileUri(this.state.cachebuster ? `${image}#${this.state.cachebuster}` : image)}
                  width={Theme.screen.width - 48}
                  height={416}
                />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.preview}>
            <Text style={styles.captureLabel}>{i18n.t('report.choosePicture')}</Text>
          </View>
        )}
        <TouchableHighlight
          disabled={
            this.props.question.maxImageCount
              ? this.props.answer?.value.length >= this.props.question.maxImageCount
              : this.props.answer?.value.length >= 5
          }
          style={styles.leftBtn}
          onPress={() => {
            Alert.alert(
              i18n.t('chooseImage.title'),
              i18n.t('chooseImage.subtitle'),
              [
                {
                  text: i18n.t('chooseImage.takePhoto'),
                  onPress: () => this.addImage(true)
                },
                {
                  text: i18n.t('chooseImage.chooseFromLibrary'),
                  onPress: () => this.addImage(false)
                }
              ],
              {
                cancelable: true
              }
            );
          }}
          activeOpacity={0.8}
          underlayColor={Theme.background.white}
        >
          <Image style={[Theme.icon, styles.leftBtnIcon]} source={cameraAddIcon} />
        </TouchableHighlight>
      </View>
    );
  }
}

export default ImageBlobInput;
