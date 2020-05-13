// @flow
import type { MappingFileType } from 'types/common.types';
import type { Thunk } from 'types/store.types';
import React, { PureComponent } from 'react';
import { Text, ScrollView, View, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import i18n from 'i18next';
import type { File } from 'types/file.types';
import Row from 'components/common/row';
import { ACCEPTED_FILE_TYPES_BASEMAPS, ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS } from 'config/constants';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import DocumentPicker from 'react-native-document-picker';
import generatedUniqueId from 'helpers/uniqueId';
const nextIcon = require('assets/next.png');
const fileIcon = require('assets/fileIcon.png');

type Props = {
  componentId: string,
  existingLayers: Array<File>,
  file: File,
  importContextualLayer: (file: File) => Thunk<Promise<void>>,
  importError: ?Error,
  importingLayer: ?string,
  mappingFileType: MappingFileType,
  popToComponentId?: ?string
};

type State = {
  file: File
};

class ImportMappingFileType extends PureComponent<Props, State> {
  static options(passProps: { mappingFileType: MappingFileType }) {
    return {
      topBar: {
        title: {
          text: i18n.t(`${passProps.mappingFileType}.import.choose`)
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

  acceptedFileTypes = (mappingFileType: MappingFileType = this.props.mappingFileType): Array<string> => {
    return mappingFileType === 'contextualLayers'
      ? ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS
      : ACCEPTED_FILE_TYPES_BASEMAPS;
  };

  i18nKeyFor(key: string): string {
    return `${this.props.mappingFileType}.import.${key}`;
  }

  importMappingFile = debounceUI(async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles, 'public.item']
      });
      const validFile = this.verifyImportedFile(res);
      if (!validFile) {
        return;
      }
      Navigation.push(this.props.componentId, {
        component: {
          name: 'ForestWatcher.ImportMappingFileRename',
          passProps: {
            file: {
              ...res,
              fileName: res.name, // Slightly tweak the res to reformat `name` -> `fileName` as we keep these seperate,
              id: generatedUniqueId(),
              name: null
            },
            mappingFileType: this.props.mappingFileType,
            popToComponentId: this.props.popToComponentId
          }
        }
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  });

  verifyImportedFile = (file: File) => {
    const fileExtension = file.name
      ?.split('.')
      ?.pop()
      ?.toLowerCase();
    if (!this.acceptedFileTypes().includes(fileExtension)) {
      this.showErrorModal(file.name);
      return false;
    }
    return true;
  };

  showErrorModal = (fileName: string) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.ImportMappingFileError',
              passProps: {
                fileName,
                mappingFileType: this.props.mappingFileType,
                onRetry: this.importMappingFile
              },
              options: {
                layout: {
                  backgroundColor: 'transparent',
                  componentBackgroundColor: 'rgba(0,0,0,0.8)'
                },
                modalPresentationStyle: 'overCurrentContext',
                screenBackgroundColor: 'rgba(0,0,0,0.8)'
              }
            }
          }
        ]
      }
    });
  };

  onImportPressed = async () => {
    try {
      await this.props.importContextualLayer(this.state.file);
      Navigation.pop(this.props.componentId);
    } catch (err) {
      console.warn(err);
    }
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

  render() {
    const gfwLayerAction = {
      icon: nextIcon,
      callback: () => {}
    };
    const customContextualLayerAction = {
      icon: null,
      callback: this.importMappingFile
    };

    const { mappingFileType } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView scrollEnabled={false} style={styles.contentContainer}>
          {mappingFileType === 'contextualLayers' ? (
            <Row action={gfwLayerAction} rowStyle={styles.row}>
              <Text style={styles.title}>{i18n.t(this.i18nKeyFor('addGFW'))}</Text>
            </Row>
          ) : null}
          <Row
            action={customContextualLayerAction}
            style={{ flex: 1, alignSelf: 'stretch' }}
            rowStyle={styles.rowWithDescription}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.t(this.i18nKeyFor('custom'))}</Text>
              <Image style={Theme.icon} source={nextIcon} />
            </View>
            <View>
              <Text style={styles.description}>{i18n.t(this.i18nKeyFor('supportedFileTypesInclude'))}</Text>
              <View style={styles.acceptedFileTypes}>
                {this.acceptedFileTypes().map(fileType => this.renderFileTypeComponent(fileType))}
              </View>
            </View>
          </Row>
        </ScrollView>
      </View>
    );
  }
}

export default ImportMappingFileType;
