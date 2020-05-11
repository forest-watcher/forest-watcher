// @flow

import type { File } from 'types/file.types';

import React, { Component } from 'react';
import { View, ScrollView, Share, Text } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
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

import Theme from 'config/theme';

type Props = {|
  +baseApiLayers: Array<ContextualLayer>,
  +componentId: string,
  +exportLayers: (ids: Array<string>) => Promise<void>,
  +importedLayers: Array<File>
|};

type State = {|
  +selectedForExport: Array<string>,
  +inShareMode: boolean
|};

class Layers extends Component<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
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

  shareSheet: any;

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      selectedForExport: [],
      inShareMode: false
    };
  }

  componentDidMount() {
    tracker.trackScreenView('Layers');
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'addLayer') {
      this.onPressAddLayer();
    }
  }

  /**
   * Handles the layer row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onLayerSelectedForExport = (layerId: string) => {
    this.setState(state => {
      if (state.selectedForExport.includes(layerId)) {
        return {
          selectedForExport: [...state.selectedForExport].filter(id => layerId !== id)
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
    // TODO: Loading screen while the async function below executed
    this.props.exportLayers(selectedLayers);
    this.shareSheet?.setSharing?.(false);
    this.setSharing(false);
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

  shareLayer = (file: ContextualLayer) => {
    Share.share({
      message: 'Sharing file',
      url: file.url
    });
  };

  renderGFWLayers = () => {
    const { baseApiLayers } = this.props;
    if (baseApiLayers.length === 0) {
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
    if (importedLayers.length === 0) {
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
              ? totalToExport === 1
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
                onActionPress={() => {}}
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
