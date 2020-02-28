// @flow
import type { Answer } from 'types/reports.types';

import React, { Component } from 'react';
import { Text, View, Image, TouchableHighlight, Alert } from 'react-native';

import ImageCard from 'components/common/image-card';
import i18n from 'i18next';
import Theme from 'config/theme';
import CONSTANTS from 'config/constants';

import styles from './styles';

const ImagePicker = require('react-native-image-picker');
const cameraAddIcon = require('assets/camera_add.png');
const deleteIcon = require('assets/delete_red.png');

type Props = {
  answer: Answer,
  onChange: Answer => void
};

class ImageBlobInput extends Component<Props> {
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
        path: CONSTANTS.appName,
        cameraRoll: true
      }
    };

    ImagePicker.showImagePicker(options, response => {
      if (response.error) {
        Alert.alert(i18n.t('commonText.error'), response.error, [{ text: 'OK' }]);
      } else if (response.uri) {
        this.handlePress(response.uri);
      }
    });
  };

  removePicture = () => {
    this.handlePress('');
  };

  handlePress = (value: string) => {
    const { answer, onChange } = this.props;
    if (value !== answer.value) {
      onChange({ ...answer, value });
    }
  };

  render() {
    const imagePath = this.props.answer.value;
    return (
      <View style={styles.container}>
        <View style={styles.preview}>
          {imagePath ? (
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
              uri={imagePath}
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
