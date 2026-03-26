// @flow
import React, { Component } from 'react';
import { View, Text, Platform, Alert, ActivityIndicator } from 'react-native';
import i18n from 'i18next';
import { Navigation } from 'react-native-navigation';
import List from 'components/common/list';

const RNFS = require('react-native-fs');
import debounceUI from 'helpers/debounceUI';
import DocumentPicker from 'react-native-document-picker';
import union from '@turf/union';
import { importLayerFile } from 'helpers/layer-store/import/importLayerFile';
import { checkBundleCompatibility, unpackBundle } from 'helpers/sharing/importBundle';
import createCustomImportFlow from 'components/sharing-bundle/import/createCustomImportFlow';

import { ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS, FILES } from 'config/constants';
import Theme from 'config/theme';
import styles from './styles';
import { trackCreateAreaType } from 'helpers/analytics';
import type { CountryArea, SetupAction } from 'types/setup.types';
import type { LayerFile } from 'types/sharing.types';
import type { ImportError } from 'components/settings/mapping-files/import/error';

type Props = {|
  +componentId: string,
  +setSetupArea: ({ area: CountryArea, snapshot: string }) => SetupAction,
  +startImport: () => SetupAction,
  +imported: boolean,
  +skipAvailable: boolean
|};
type State = {|
  +isLoading: boolean
|};

type CreateSection = {
  text: string,
  section?: ?string,
  functionOnPress: (string, string) => void
};

class CreateArea extends Component<Props, State> {
  static options(passProps: { goBackDisabled: boolean, skipAvailable: boolean }): any {
    return {
      topBar: {
        title: {
          text: i18n.t('createAnArea.title')
        },
        rightButtons: passProps.skipAvailable && [
          {
            id: 'skip',
            text: i18n.t('commonText.skip'),
            fontSize: 16,
            fontFamily: Theme.font,
            fontWeight: '400',
            allCaps: false,
            color: Theme.colors.turtleGreen,
            backgroundColor: Theme.background.main
          }
        ]
      }
    };
  }

  navigationButtonPressed({ buttonId }: any) {
    if (buttonId === 'skip') {
      Navigation.setStackRoot(this.props.componentId, {
        component: {
          id: 'ForestWatcher.Dashboard',
          name: 'ForestWatcher.Dashboard'
        }
      });
    }
  }

  createSections: Array<CreateSection>;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false
    };
    this.createSections = [
      {
        text: i18n.t('createAnArea.sections.drawArea'),
        functionOnPress: () => {
          if (this.state.isLoading) {
            return;
          }
          trackCreateAreaType('draw');
          Navigation.push(this.props.componentId, {
            component: {
              name: 'ForestWatcher.SetupCountry',
              passProps: {
                skipAvailable: this.props.skipAvailable
              }
            }
          });
        }
      },
      {
        text: i18n.t('createAnArea.sections.uploadShapefile'),
        functionOnPress: this.importShapefile
      },
      {
        text: i18n.t('createAnArea.sections.importBundle'),
        functionOnPress: this.importFromBundle
      }
    ];
    Navigation.events().bindComponent(this);
  }

  async componentDidUpdate(prevProps: Props) {
    if (prevProps.imported !== this.props.imported && this.props.imported) {
      await Navigation.setStackRoot(this.props.componentId, {
        component: {
          id: 'ForestWatcher.Dashboard',
          name: 'ForestWatcher.Dashboard'
        }
      });

      Navigation.push('ForestWatcher.Dashboard', {
        component: {
          name: 'ForestWatcher.Areas',
          passProps: {
            scrollToBottom: true
          }
        }
      });
    }
  }

  importShapefile: () => void = debounceUI(async () => {
    if (this.state.isLoading) {
      return;
    }
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles, 'public.item']
      });

      const validFile = await this.verifyShapefile(res);
      if (!validFile) {
        return;
      }
      res.fileName = res.name;

      this.setState({
        isLoading: true
      });

      // Import and parse shapefile types (kmz, zip, etc.)
      const importedFile: LayerFile = await importLayerFile(res);
      const importedFileDir = await RNFS.readDir(importedFile.path);
      const shapefileGeoJson = await RNFS.readFile(importedFileDir[0].path);
      const geoJsonObject = JSON.parse(shapefileGeoJson);

      if (geoJsonObject && geoJsonObject.features) {
        // reduce FeatureCollections into singular feature set
        const geojsonParsed = await geoJsonObject.features.reduce(union);
        this.props.setSetupArea({
          area: {
            name: '',
            geojson: geojsonParsed.geometry
          },
          snapshot: ''
        });

        trackCreateAreaType('upload');
        Navigation.push(this.props.componentId, {
          component: {
            name: 'ForestWatcher.ShapefileOverview'
          }
        });
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      } else {
        Alert.alert(i18n.t('commonText.error'), i18n.t('createAnArea.invalidShapefile'), [{ text: 'OK' }]);
      }
    } finally {
      this.setState({
        isLoading: false
      });
    }
  });

  importFromBundle: () => void = debounceUI(async () => {
    if (this.state.isLoading) {
      return;
    }
    this.setState({ isLoading: true });
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles, 'public.item']
      });

      const uri = Platform.OS === 'android' ? res.uri : decodeURI(res.uri).replace('file:///', '');
      const unpackedBundle = await unpackBundle(uri);
      checkBundleCompatibility(unpackedBundle.data.version);

      // Create custom import flow with only areas extracted from bundle
      const customImportFlow = createCustomImportFlow(unpackedBundle);
      const component = {
        component: {
          name: 'ForestWatcher.ImportBundleConfirm',
          passProps: {
            formState: { ...customImportFlow, numSteps: 0 },
            importRequest: {
              areas: true,
              customBasemaps: {
                metadata: false
              },
              customContextualLayers: {
                metadata: false
              },
              gfwContextualLayers: {
                metadata: false
              },
              reports: false,
              routes: false
            }
          }
        }
      };
      trackCreateAreaType('FWBundle');
      this.props.startImport();
      Navigation.showModal({
        stack: {
          children: [component]
        }
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit and move on
        return;
      } else {
        Alert.alert(i18n.t('commonText.error'), i18n.t('createAnArea.invalidBundle'), [{ text: 'OK' }]);
      }
    } finally {
      this.setState({
        isLoading: false
      });
    }
  });

  verifyShapefile: (file: File) => boolean = (file: File) => {
    // $FlowFixMe
    const fileExtension = file.name
      .split('.')
      ?.pop()
      ?.toLowerCase();

    if (!ACCEPTED_FILE_TYPES_CONTEXTUAL_LAYERS.includes(fileExtension)) {
      this.showErrorModal(file, 'fileFormat');
      return false;
    }
    if (file.size > FILES.maxFileSizeForLayerImport) {
      this.showErrorModal(file, 'fileSize');
      return false;
    }

    return true;
  };

  showErrorModal: (file: File, error: ImportError) => void = (file: File, error: ImportError) => {
    Navigation.showModal({
      stack: {
        children: [
          {
            component: {
              name: 'ForestWatcher.ImportMappingFileError',
              passProps: {
                error,
                file,
                mappingFileType: 'contextual_layer',
                onRetry: this.importShapefile
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

  render(): React$Element<any> {
    return (
      <View style={styles.container}>
        <View style={styles.areaSection}>
          <Text style={styles.label}>{i18n.t('createAnArea.subtitle')}</Text>
          <List content={this.createSections} bigSeparation={false}>
            {}
          </List>
        </View>
        {this.state.isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator color={Theme.colors.turtleGreen} style={{ height: 80 }} size="large" />
          </View>
        )}
      </View>
    );
  }
}

export default CreateArea;
