// @flow
import React, { Component } from 'react';
import { View, ScrollView, Share, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import debounceUI from 'helpers/debounceUI';
import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';
import EmptyState from 'components/common/empty-state';
import ShareSheet from 'components/common/share';
import ActionsRow from 'components/common/actions-row';
import { formatBytes } from 'helpers/data';

import type { ContextualLayer } from 'types/layers.types';

const plusIcon = require('assets/add.png');
const emptyIcon = require('assets/layersEmpty.png');
const layerPlaceholder = require('assets/layerPlaceholder.png');

type Props = {
  baseApiLayers: ?Array<ContextualLayer>,
  componentId: string,
  importedLayers: Array<File>
};

class Layers extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('contextualLayers.title')
        },
        rightButtons: [
          {
            id: 'addLayer',
            icon: plusIcon
          }
        ]
      }
    };
  }

  constructor(props) {
    super(props);
    this.navigationEventListener = Navigation.events().bindComponent(this);
    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      selectedForExport: [],
      inShareMode: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Layers');
  }

  componentWillUnmount() {
    // Not mandatory
    if (this.navigationEventListener) {
      this.navigationEventListener.remove();
    }
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'addLayer') {
      this.onPressAddLayer();
    }
  }

  /**
   * Handles the layer row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onLayerSelectedForExport = layerId => {
    this.setState(state => {
      if (state.selectedForExport.includes(layerId)) {
        return {
          selectedForExport: [...state.selectedForExport].filter(id => layerId != id)
        };
      } else {
        const selected = [...state.selectedForExport];
        selected.push(layerId);
        return {
          selectedForExport: selected
        };
      }
    });
  };

  /**
   * Handles the 'export <x> layers' button being tapped.
   *
   * @param  {Array} selectedLayers An array of layer identifiers that have been selected for export.
   */
  onExportLayersTapped = debounceUI(selectedLayers => {
    //const layers = this.props.layers || [];

    // Iterate through the selected reports. If the layer has been marked to export, find the full layer object.
    //const layersToExport = selectedLayers.map(layerId => {
    //  const selectedLayer = layers.find(layer => layer.id === layerId);
    //  return selectedLayer;
    //});

    // await exportReports(
    //   reportsToExport,
    //   this.props.templates,
    //   this.props.appLanguage,
    //   Platform.select({
    //     android: RNFetchBlob.fs.dirs.DownloadDir,
    //     ios: RNFetchBlob.fs.dirs.DocumentDir
    //   })
    // );

    // // TODO: Handle errors returned from export function.

    // // Show 'export successful' notification, and reset export state to reset UI.
    // this.props.showExportReportsSuccessfulNotification();
    this.shareSheet?.setSharing?.(false);
    this.setState({
      inShareMode: false,
      selectedForExport: []
    });
    Navigation.mergeOptions(this.props.componentId, {
      topBar: {
        rightButtons: [
          {
            id: 'addLayer',
            icon: plusIcon
          }
        ]
      }
    });

    // if (Platform.OS === 'android') {
    //   NativeModules.Intents.launchDownloadsDirectory();
    // }
  });

  onPressAddLayer = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.ImportLayerType',
        passProps: {
          popToComponentId: this.props.componentId
        }
      }
    });
  });

  setAllSelected = (selected: boolean) => {
    // todo: Add back in once we have redux state for layers
    // this.setState({
    //   selectedForExport: selected ? this.props.layers.map(layer => layer.id) : []
    // });
  };

  setSharing = (sharing: boolean) => {
    this.setState({
      inShareMode: sharing
    });

    if (!sharing) {
      this.setState({
        selectedForExport: []
      });
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [
            {
              id: 'addLayer',
              icon: plusIcon
            }
          ]
        }
      });
    }
  };

  shareLayer = file => {
    Share.share({
      message: 'Sharing file',
      url: file.uri
    });
  };

  renderGFWLayers = () => {
    const { baseApiLayers } = this.props;
    if (baseApiLayers.length == 0) {
      return null;
    }
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t('contextualLayers.gfw')}</Text>
        </View>
        {baseApiLayers.map((layerFile, index) => {
          return (
            <ActionsRow style={styles.rowContent} imageSrc={layerPlaceholder} key={index}>
              <Text style={styles.rowLabel}>{i18n.t(layerFile.name)}</Text>
              {layerFile.size != null && <Text style={styles.rowLabel}>{formatBytes(layerFile.size)}</Text>}
            </ActionsRow>
          );
        })}
      </View>
    );
  };

  renderImportedLayers = () => {
    const { importedLayers } = this.props;
    if (importedLayers.length == 0) {
      return null;
    }
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t('contextualLayers.imported')}</Text>
        </View>
        {importedLayers.map((layerFile, index) => {
          return (
            <ActionsRow
              onPress={this.shareLayer.bind(this, layerFile)}
              style={styles.rowContent}
              imageSrc={layerPlaceholder}
              key={index}
            >
              <Text style={styles.rowLabel}>{layerFile.name}</Text>
              {layerFile.size != null && <Text style={styles.rowLabel}>{formatBytes(layerFile.size)}</Text>}
            </ActionsRow>
          );
        })}
      </View>
    );
  };

  render() {
    //todo: add this back in once we have redux state for layers!
    const { baseApiLayers, importedLayers } = this.props;
    // Determine if we're in export mode, and how many layers have been selected to export.
    const totalToExport = this.state.selectedForExport.length;

    //todo: add this back in once we have redux state for layers!
    const totalLayers = importedLayers.length + baseApiLayers.length;

    //todo: add this back in once we have redux state for layers!
    const hasLayers = totalLayers > 0;

    return (
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
          shareButtonDisabledTitle={i18n.t('contextualLayers.share')}
          enabled={totalToExport > 0}
          onShare={() => {
            this.onExportLayersTapped(this.state.selectedForExport);
          }}
          onSharingToggled={this.setSharing}
          onToggleAllSelected={this.setAllSelected}
          ref={ref => {
            this.shareSheet = ref;
          }}
          selected={totalToExport}
          selectAllCountText={
            totalLayers > 1
              ? i18n.t('contextualLayers.export.manyLayers', { count: totalLayers })
              : i18n.t('contextualLayers.export.oneLayer', { count: 1 })
          }
          shareButtonEnabledTitle={
            totalToExport > 0
              ? totalToExport == 1
                ? i18n.t('contextualLayers.export.oneLayerAction', { count: 1 })
                : i18n.t('contextualLayers.export.manyLayersAction', { count: totalToExport })
              : i18n.t('contextualLayers.export.noneSelected')
          }
        >
          {hasLayers ? (
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {this.renderGFWLayers()}
              {this.renderImportedLayers()}
            </ScrollView>
          ) : (
            <View style={styles.containerEmpty}>
              <EmptyState
                actionTitle={i18n.t('contextualLayers.empty.action')}
                body={i18n.t('contextualLayers.empty.body')}
                icon={emptyIcon}
                onActionPress={this.onFrequentlyAskedQuestionsPress}
                title={i18n.t('contextualLayers.empty.title')}
              />
            </View>
          )}
        </ShareSheet>
      </View>
    );
  }
}

export default Layers;
