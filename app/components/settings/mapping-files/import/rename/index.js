// @flow

import React, { PureComponent } from 'react';
import { Keyboard, Platform, Text, ScrollView, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import InputText from 'components/common/text-input';
import i18n from 'i18next';
import type { LayerType } from 'types/sharing.types';
import type { File } from 'types/file.types';
import type { Layer, LayersAction } from 'types/layers.types';
import type { Thunk } from 'types/store.types';

import KeyboardSpacer from 'react-native-keyboard-spacer';
import { ERROR_CODES } from 'helpers/fwError';
import fileNameIsValid from 'helpers/validation/fileNames';

type Props = {
  clearState: () => LayersAction,
  componentId: string,
  existing: Array<Layer>,
  file: File,
  import: (file: File) => Thunk<Promise<void>>,
  importError: ?Error,
  importing: boolean,
  mappingFileType: LayerType,
  onImported: () => void,
  popToComponentId?: ?string
};

type State = {
  file: File,
  keyboardVisible: boolean
};

class ImportMappingFileRename extends PureComponent<Props, State> {
  static options(passProps: { mappingFileType: LayerType }) {
    return {
      topBar: {
        title: {
          text: i18n.t(`${passProps.mappingFileType === 'basemap' ? 'basemaps' : 'contextualLayers'}.import.title`)
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    this.props.clearState();
    Navigation.events().bindComponent(this);
    this.state = {
      file: this.props.file,
      keyboardVisible: false
    };
  }

  i18nKeyFor(key: string): string {
    const base = this.props.mappingFileType === 'basemap' ? 'basemaps' : 'contextualLayers';
    return `${base}.import.${key}`;
  }

  onFileNameChange = (newName: string) => {
    this.setState(state => ({
      file: {
        ...this.state.file,
        name: newName
      }
    }));
  };

  onImportPressed = async () => {
    try {
      Keyboard.dismiss();

      await this.props.import(this.state.file);
      this.props.onImported();

      if (this.props.popToComponentId) {
        Navigation.popTo(this.props.popToComponentId);
      } else {
        Navigation.pop(this.props.componentId);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  nameValidity = () => {
    const { id, name } = this.state.file;

    return fileNameIsValid(id, name, this.props.existing);
  };

  render() {
    if (!this.state.file) {
      return null;
    }

    const nameValidity = this.nameValidity();

    return (
      <View style={styles.container}>
        <ScrollView scrollEnabled={false} keyboardShouldPersistTaps="handled" style={styles.contentContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{this.props.file.fileName}</Text>
          </View>
          <InputText
            value={this.state.file.name}
            placeholder={i18n.t('commonText.fileName')}
            onChangeText={this.onFileNameChange}
            editable={!this.props.importing}
          />
          {nameValidity.alreadyTaken && (
            <View style={styles.errorContainer}>
              <Text style={[styles.listTitle, styles.error]}>{i18n.t(this.i18nKeyFor('uniqueNameError'))}</Text>
            </View>
          )}
          {!!this.props.importError && (
            <View style={styles.errorContainer}>
              <Text style={[styles.listTitle, styles.error]}>
                {this.props.importError.code === ERROR_CODES.FILE_TOO_LARGE
                  ? `${i18n.t(this.i18nKeyFor('fileSizeTooLarge'))}: ${i18n.t(this.i18nKeyFor('fileSizeTooLargeDesc'))}`
                  : i18n.t(this.i18nKeyFor('error'))}
              </Text>
            </View>
          )}
        </ScrollView>
        <BottomTray requiresSafeAreaView={!this.state.keyboardVisible} showProgressBar={this.props.importing}>
          <ActionButton
            onPress={nameValidity.valid ? this.onImportPressed : null}
            text={i18n.t(this.i18nKeyFor('save'))}
            disabled={!nameValidity.valid || this.props.importing}
            short
            noIcon
          />
        </BottomTray>
        {Platform.OS === 'ios' && (
          <KeyboardSpacer
            onToggle={visible => {
              this.setState({
                keyboardVisible: visible
              });
            }}
          />
        )}
      </View>
    );
  }
}

export default ImportMappingFileRename;
