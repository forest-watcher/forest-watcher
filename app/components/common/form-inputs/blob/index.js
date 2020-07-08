// @flow
import type { Answer } from 'types/reports.types';

import React, { Component } from 'react';
import { Text, View, Image, TouchableHighlight, Alert } from 'react-native';
import Config from 'react-native-config';
import ImagePicker from 'react-native-image-picker';

import ImageCard from 'components/common/image-card';
import i18n from 'i18next';
import Theme from 'config/theme';

import styles from './styles';

import { storeReportFiles } from 'helpers/report-store/storeReportFiles';
import deleteReportFiles from 'helpers/report-store/deleteReportFiles';
import { pathForReportQuestionAttachment } from 'helpers/report-store/reportFilePaths';
import { toFileUri } from 'helpers/fileURI';
import { REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT } from 'helpers/forms';

const cameraAddIcon = require('assets/camera_add.png');
const deleteIcon = require('assets/delete_red.png');

type Props = {
  answer: Answer,
  onChange: Answer => void,
  reportName: string
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
  launchCamera = () => {
    const options = {
      mediaType: 'photo',
      noData: true,
      quality: 0.7,
      title: i18n.t('chooseImage.title'),
      takePhotoButtonTitle: i18n.t('chooseImage.takePhoto'),
      chooseFromLibraryButtonTitle: i18n.t('chooseImage.chooseFromLibrary'),
      cancelButtonTitle: i18n.t('chooseImage.cancel'),
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true,
        path: Config.APP_NAME,
        cameraRoll: true,
        privateDirectory: true
      }
    };

    ImagePicker.showImagePicker(options, async response => {
      if (response.error) {
        Alert.alert(i18n.t('commonText.error'), response.error, [{ text: 'OK' }]);
      } else if (response.uri) {
        // Don't store the exact URI against the answer because this breaks when we share the report.
        // Instead just store a value to indicate that there is an attachment present
        this.handlePress(REPORT_BLOB_IMAGE_ATTACHMENT_PRESENT);
        await storeReportFiles([
          {
            reportName: this.props.reportName,
            questionName: this.props.answer.questionName,
            type: 'image/jpeg',
            path: decodeURI(response.uri),
            size: response.fileSize
          }
        ]);
        this.setState({
          cachebuster: `t${Date.now()}`
        });
      }
    });
  };

  handlePress = (value: ?string) => {
    const { answer, onChange } = this.props;
    if (value !== answer.value) {
      onChange({ ...answer, value });
    }
  };

  removePicture = async () => {
    this.handlePress(null);
    await deleteReportFiles({
      reportName: this.props.reportName,
      questionName: this.props.answer.questionName
    });
    this.setState({
      cachebuster: null
    });
  };

  render() {
    const imagePath = pathForReportQuestionAttachment(
      this.props.reportName,
      this.props.answer.questionName,
      'image/jpeg'
    );
    const imagePathCacheBusted = this.state.cachebuster ? `${imagePath}#${this.state.cachebuster}` : null;
    return (
      <View style={styles.container}>
        <View style={styles.preview}>
          {imagePathCacheBusted ? (
            <ImageCard
              id={'imagePreview'}
              key={1}
              name={'imagePreview'}
              actions={[
                {
                  callback: this.removePicture,
                  icon: deleteIcon
                }
              ]}
              uri={toFileUri(imagePathCacheBusted)}
              width={Theme.screen.width - 48}
              height={416}
            />
          ) : (
            <Text style={styles.captureLabel}>{i18n.t('report.choosePicture')}</Text>
          )}
        </View>
        <TouchableHighlight
          style={styles.leftBtn}
          onPress={this.launchCamera}
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
