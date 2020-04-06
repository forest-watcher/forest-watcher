// @flow
import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';
import i18n from 'i18next';
import styles from './styles';
import ActionButton from 'components/common/action-button';
import { withSafeArea } from 'react-native-safe-area';
import { ACCEPTED_FILE_TYPES } from 'components/settings/contextual-layers/import-layer-type';
const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

const fileIcon = require('assets/fileIcon.png');

type Props = {
  componentId: string,
  fileName: string,
  onRetry: () => {}
};

export default class ImportLayerError extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  renderFileTypeComponent = (fileType: string) => {
    return (
      <View style={styles.fileTypeContainer}>
        <Image source={fileIcon} />
        <Text style={styles.fileTypeText} key={fileType}>
          .{fileType}
        </Text>
      </View>
    );
  };

  onPressChooseAnother = () => {
    Navigation.dismissModal(this.props.componentId);
    this.props.onRetry();
  };

  onPressCancel = () => {
    Navigation.dismissModal(this.props.componentId);
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{i18n.t('importLayer.fileTypeNotSupported')}</Text>
          <Text style={styles.fileName}>'{this.props.fileName}'</Text>
          <Text style={styles.description}>{i18n.t('importLayer.fileTypeNotSupportedDesc')}</Text>
          <Text style={styles.fileTypesDescription}>{i18n.t('importLayer.supportedFileTypesInclude')}</Text>
          <View style={styles.acceptedFileTypes}>
            {ACCEPTED_FILE_TYPES.map(fileType => this.renderFileTypeComponent(fileType))}
          </View>
          <ActionButton onPress={this.onPressChooseAnother} secondary noIcon text={i18n.t('importLayer.chooseAnother')} />
          <Text style={styles.actionText} onPress={this.onPressCancel}>
            {i18n.t('commonText.cancel')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}
