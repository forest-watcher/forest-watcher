// @flow
import type { LayerType } from 'types/sharing.types';
import React, { PureComponent } from 'react';
import { Text, ScrollView, View, Image, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { getMBTilesMetadata } from 'react-native-mbtiles';

import styles from './styles';
import i18n from 'i18next';
import type { File } from 'types/file.types';
import Row from 'components/common/row';
import { ACCEPTED_FILE_TYPES_BASEMAPS, ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS, FILES } from 'config/constants';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import DocumentPicker from 'react-native-document-picker';
import generatedUniqueId from 'helpers/uniqueId';
import { copyFileWithReplacement } from 'helpers/fileManagement';
const RNFS = require('react-native-fs');

const nextIcon = require('assets/next.png');
const fileIcon = require('assets/fileIcon.png');

import type { ImportError } from '../error';

type Props = {
  componentId: string,
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
      const validFile = await this.verifyImportedFile(res);
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
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.GFWLayers',
        passProps: {
          popToComponentId: this.props.popToComponentId
        }
      }
    });
  });

  onFAQPress = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqCategory',
        passProps: {
          category: {
            title: i18n.t('faq.categories.customLayers.title'),
            questions: i18n.t('faq.categories.customLayers.questions', { returnObjects: true })
          }
        }
      }
    });
  });

  verifyImportedFile = async (file: File) => {
    const fileExtension = file.name
      ?.split('.')
      ?.pop()
      ?.toLowerCase();

    // First, ensure that this file is one of the supported file types.
    if (!this.acceptedFileTypes().includes(fileExtension)) {
      this.showErrorModal(file, 'fileFormat');
      return false;
    }
    if (this.props.mappingFileType === 'contextual_layer' && file.size > FILES.maxFileSizeForLayerImport) {
      this.showErrorModal(file, 'fileSize');
      return false;
    }

    if (this.props.mappingFileType === 'basemap') {
      // On Android, the MBTiles lib is unable to read metadata from arbitrary URIs... so we copy the file locally
      // so that we can give it a file: URI
      const tempUri = `${RNFS.TemporaryDirectoryPath}/${Date.now()}.mbtiles`;

      try {
        await copyFileWithReplacement(file.uri, tempUri);
        const metadata = await getMBTilesMetadata(tempUri);
        if (!metadata) {
          // There's no metadata - an error has occurred. Maybe the file is broken?
          this.showErrorModal(file, 'fileFormat');
          return false;
        }

        if (metadata.isVector) {
          // This mbtiles file contains vector tiles - we do not support them.
          this.showErrorModal(file, 'vectorTiles');
          return false;
        }
      } catch (err) {
        console.error(err);
        throw err;
      } finally {
        await RNFS.unlink(tempUri);
      }
    }

    return true;
  };

  showErrorModal = (file: File, error: ImportError) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.ImportMappingFileError',
              passProps: {
                error,
                file,
                mappingFileType: this.props.mappingFileType,
                onRetry: this.importMappingFile
              },
              options: {
                animations: Theme.navigationAnimations.fadeModal,
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
          {mappingFileType === 'contextual_layer' ? (
            <View style={styles.faqContainer}>
              <TouchableOpacity onPress={this.onFAQPress}>
                <Text style={styles.actionText}>{i18n.t(this.i18nKeyFor('faq'))}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

export default ImportMappingFileType;
