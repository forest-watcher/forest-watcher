// @flow
import type { MappingFileType } from 'types/common.types';
import React, { Component } from 'react';
import { View, Text, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';
import i18n from 'i18next';
import styles from './styles';
import ActionButton from 'components/common/action-button';
import { withSafeArea } from 'react-native-safe-area';
import { ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS, ACCEPTED_FILE_TYPES_BASEMAPS } from 'config/constants';
const SafeAreaView = withSafeArea(View, 'margin', 'vertical');

const fileIcon = require('assets/fileIcon.png');

type Props = {
  componentId: string,
  fileName: string,
  mappingFileType: MappingFileType,
  onRetry: () => {}
};

export default class ImportMappingFileError extends Component<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        drawBehind: true,
        visible: false,
        background: {
          color: 'transparent'
        }
      }
    };
  }

  i18nKeyFor(key: string): string {
    return `${this.props.mappingFileType}.import.${key}`;
  }

  acceptedFileTypes = (mappingFileType: MappingFileType = this.props.mappingFileType): Array<string> => {
    return mappingFileType === 'contextualLayers'
      ? ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS
      : ACCEPTED_FILE_TYPES_BASEMAPS;
  };

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

  onPressChooseAnother = async () => {
    await Navigation.dismissModal(this.props.componentId);
    this.props.onRetry();
  };

  onPressCancel = () => {
    Navigation.dismissModal(this.props.componentId);
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{i18n.t(this.i18nKeyFor('fileTypeNotSupported'))}</Text>
          <Text style={styles.fileName}>
            {"'"}
            {this.props.fileName}
            {"'"}
          </Text>
          <Text style={styles.description}>{i18n.t(this.i18nKeyFor('fileTypeNotSupportedDesc'))}</Text>
          <Text style={styles.fileTypesDescription}>{i18n.t(this.i18nKeyFor('supportedFileTypesInclude'))}</Text>
          <View style={styles.acceptedFileTypes}>
            {this.acceptedFileTypes().map(fileType => this.renderFileTypeComponent(fileType))}
          </View>
          <ActionButton
            onPress={this.onPressChooseAnother}
            secondary
            noIcon
            text={i18n.t('contextualLayers.import.chooseAnother')}
          />
          <Text style={styles.actionText} onPress={this.onPressCancel}>
            {i18n.t('commonText.cancel')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}
