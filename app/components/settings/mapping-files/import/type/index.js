// @flow
import type { LayerType } from 'types/sharing.types';
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
  isConnected: boolean,
  mappingFileType: LayerType,
  onImported: () => void,
  popToComponentId?: ?string
};

type State = {};

class ImportMappingFileType extends PureComponent<Props, State> {
  static options(passProps: { mappingFileType: LayerType }) {
    return {
      topBar: {
        title: {
          text: i18n.t(`${passProps.mappingFileType === 'basemap' ? 'basemaps' : 'contextualLayers'}.import.choose`)
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  acceptedFileTypes = (mappingFileType: LayerType = this.props.mappingFileType): Array<string> => {
    return mappingFileType === 'contextual_layer'
      ? ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS
      : ACCEPTED_FILE_TYPES_BASEMAPS;
  };

  i18nKeyFor(key: string): string {
    const base = this.props.mappingFileType === 'basemap' ? 'basemaps' : 'contextualLayers';
    return `${base}.import.${key}`;
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
            onImported: this.props.onImported,
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

  importGFWLayer = debounceUI(() => {
    if (!this.props.isConnected) {
      return;
    }
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.GFWLayers'
      }
    });
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
      callback: this.importGFWLayer
    };
    const customContextualLayerAction = {
      icon: null,
      callback: this.importMappingFile
    };

    const { mappingFileType } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView alwaysBounceVertical={false} style={styles.contentContainer}>
          {mappingFileType === 'contextual_layer' ? (
            <Row
              action={gfwLayerAction}
              opacity={!this.props.isConnected ? 1.0 : 0.5}
              rowStyle={styles.row}
              iconStyle={!this.props.isConnected ? { opacity: 0.6 } : {}}
            >
              <Text style={[styles.title, !this.props.isConnected ? { opacity: 0.6 } : {}]}>
                {i18n.t(this.i18nKeyFor('addGFW'))}
              </Text>
              {!this.props.isConnected && (
                <Text style={[styles.description, { paddingTop: 10 }]}>
                  {i18n.t(this.i18nKeyFor('offlineWarning'))}
                </Text>
              )}
            </Row>
          ) : null}
          <Row
            action={customContextualLayerAction}
            style={{ flex: 1, alignSelf: 'stretch' }}
            rowStyle={styles.rowWithDescription}
          >
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.t(this.i18nKeyFor('custom'))}</Text>
              <Image style={[Theme.icon, { marginRight: 0 }]} source={nextIcon} />
            </View>
            <View style={styles.verticalSeparator} />
            <View>
              <Text style={styles.description}>{i18n.t(this.i18nKeyFor('supportedFileTypesInclude'))}</Text>
              <View style={styles.acceptedFileTypes}>
                {this.acceptedFileTypes().map(fileType => this.renderFileTypeComponent(fileType))}
              </View>
            </View>
          </Row>
          <View style={styles.faqContainer}>
            <Text style={styles.actionText} onPress={this.onFaqPress}>
              {i18n.t(this.i18nKeyFor('faq'))}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

export default ImportMappingFileType;
