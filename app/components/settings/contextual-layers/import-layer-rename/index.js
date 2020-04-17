// @flow

import React, { PureComponent } from 'react';
import { Text, ScrollView, View } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import InputText from 'components/common/text-input';
import i18n from 'i18next';
import type { File } from 'types/file.types';

import KeyboardSpacer from 'react-native-keyboard-spacer';

type Props = {
  componentId: string,
  existingLayers: Array<File>,
  file: File,
  importContextualLayer: (file: File, fileName: string) => void,
  importError: ?*,
  importingLayer: ?string
};

class ImportLayerRename extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('importLayer.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    this.state = {
      file: this.props.file
    };
  }

  onFileNameChange = newName => {
    this.setState(state => ({
      file: {
        ...this.state.file,
        name: newName
      }
    }));
  };

  onImportPressed = async () => {
    try {
      await this.props.importContextualLayer(this.state.file);
      Navigation.pop(this.props.componentId);
    } catch (err) {
      console.warn(err);
    }
  };

  nameValidity = () => {
    if (!this.state.file.name) {
      return {
        valid: false,
        alreadyTaken: false
      };
    }

    const matchingFile = this.props.existingLayers.find(layer => {
      // We also make sure we're not conflicting with ourself here...
      // Because the file is added before the screen disappears if we don't make
      // sure the "matches" id is different to the currently adding files id
      // then the duplicate name message is shown as the screen is dismissing on iOS
      return layer.name === this.state.file.name && layer.id !== this.state.file.id;
    });

    const nameAlreadyTaken = !!matchingFile;

    return {
      valid: !nameAlreadyTaken && this.state.file.name.length > 0 && this.state.file.name.length <= 40,
      alreadyTaken: nameAlreadyTaken
    };
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
          />
          {nameValidity.alreadyTaken && (
            <View style={styles.errorContainer}>
              <Text style={[styles.listTitle, styles.error]}>{i18n.t('importLayer.uniqueNameError')}</Text>
            </View>
          )}
          {!!this.props.importError && (
            <View style={styles.errorContainer}>
              <Text style={[styles.listTitle, styles.error]}>{i18n.t('importLayer.error')}</Text>
            </View>
          )}
        </ScrollView>
        <BottomTray requiresSafeAreaView={!this.state.keyboardVisible}>
          <ActionButton
            onPress={nameValidity.valid ? this.onImportPressed : null}
            text={i18n.t('importLayer.save').toUpperCase()}
            disabled={!nameValidity.valid || !!this.props.importingLayer}
            short
            noIcon
          />
        </BottomTray>
        <KeyboardSpacer
          onToggle={visible => {
            this.setState({
              keyboardVisible: visible
            });
          }}
        />
      </View>
    );
  }
}

export default ImportLayerRename;
