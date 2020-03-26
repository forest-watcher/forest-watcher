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

type Props = {
  componentId: string,
  file: File,
  importContextualLayer: (file: File, fileName: string) => void,
  importingFile: ?string
};

class ImportLayer extends PureComponent<Props> {
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
      this.props.importContextualLayer(this.state.file);
      Navigation.pop(this.props.componentId);
    } catch (err) {
      //todo: Show error!
    }
  };

  render() {
    if (!this.state.file) {
      return null;
    }

    return (
      <View style={styles.container}>
        <ScrollView style={styles.contentContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{this.props.file.fileName}</Text>
          </View>
          <InputText
            value={this.state.file.name}
            placeholder={i18n.t('commonText.fileName')}
            onChangeText={this.onFileNameChange}
          />
        </ScrollView>
        <BottomTray>
          <ActionButton
            onPress={this.state.file.name && this.state.file.name.length > 0 && this.state.file.name.length <= 40 ? this.onImportPressed : null}
            text={i18n.t('importLayer.save').toUpperCase()}
            disabled={!this.state.file.name || this.state.file.name.length === 0 || this.state.file.name.length > 40}
            short
            noIcon
          />
        </BottomTray>
      </View>
    );
  }
}

export default ImportLayer;
