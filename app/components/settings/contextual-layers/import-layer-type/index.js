import React, { PureComponent } from 'react';
import { Text, ScrollView, View, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import i18n from 'i18next';
import type { File } from 'types/file.types';
import Row from 'components/common/row';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import DocumentPicker from 'react-native-document-picker';
import generatedUniqueId from 'helpers/uniqueId';
const nextIcon = require('assets/next.png');
const fileIcon = require('assets/fileIcon.png');

export const ACCEPTED_FILE_TYPES = ['json', 'geojson', 'topojson', 'gpx', 'shp', 'kmz', 'kml'];
const TODO_FILE_TYPES = ['topojson', 'shp']; // todo remove when finished implementation

type Props = {
  componentId: string,
  existingLayers: Array<File>,
  file: File,
  importContextualLayer: (file: File, fileName: string) => void,
  importError: ?*,
  importingLayer: ?string
};

class ImportLayerType extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('importLayer.chooseContextualLayerType')
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

  importCustomContextualLayer = debounceUI(async () => {
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
          name: 'ForestWatcher.ImportLayerRename',
          passProps: {
            file: {
              ...res,
              fileName: res.name, // Slightly tweak the res to reformat `name` -> `fileName` as we keep these seperate,
              id: generatedUniqueId(),
              name: null
            }
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

  verifyImportedFile = file => {
    const fileExtension = file.name
      .split('.')
      .pop()
      .toLowerCase();
    if (!ACCEPTED_FILE_TYPES.includes(fileExtension) || TODO_FILE_TYPES.includes(fileExtension)) {
      this.showModal(file.name);
      return false;
    }
    return true;
  };

  showModal = fileName => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.ImportLayerError',
              passProps: {
                fileName,
                onRetry: this.importCustomContextualLayer
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
      callback: this.importCustomContextualLayer
    };
    return (
      <View style={styles.container}>
        <ScrollView scrollEnabled={false} style={styles.contentContainer}>
          <Row action={gfwLayerAction} rowStyle={styles.row}>
            <Text style={styles.title}>{i18n.t('importLayer.addGFWLayer')}</Text>
          </Row>
          <Row action={customContextualLayerAction} rowStyle={styles.rowWithDescription}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{i18n.t('importLayer.customContextualLayer')}</Text>
              <Image style={Theme.icon} source={nextIcon} />
            </View>
            <View>
              <Text style={styles.description}>{i18n.t('importLayer.supportedFileTypesInclude')}</Text>
              <View style={styles.acceptedFileTypes}>
                {ACCEPTED_FILE_TYPES.map(fileType => this.renderFileTypeComponent(fileType))}
              </View>
            </View>
          </Row>
        </ScrollView>
      </View>
    );
  }
}

export default ImportLayerType;
