// @flow
import type { LayerType } from 'types/sharing.types';
import type { Layer, LayersCacheStatus, LayerCacheData } from 'types/layers.types';
import React, { Component } from 'react';
import { View, ScrollView, Share, Text } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import i18n from 'i18next';

import EmptyState from 'components/common/empty-state';
import ShareSheet from 'components/common/share';
import Constants, { GFW_CONTEXTUAL_LAYERS_METADATA } from 'config/constants';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import showDeleteConfirmationPrompt from 'helpers/showDeleteModal';
import { trackScreenView } from 'helpers/analytics';

import styles from './styles';
import MappingFileRow from 'components/settings/mapping-files/mapping-file-row';
import showRenameModal from 'helpers/showRenameModal';
import { presentInformationModal, showFAQSection } from 'screens/common';
import fileNameIsValid from 'helpers/validation/fileNames';
import { getShareButtonText } from 'helpers/sharing/utils';
import generateUniqueID from 'helpers/uniqueId';
import calculateBundleSize from 'helpers/sharing/calculateBundleSize';

const plusIcon = require('assets/add.png');
const icons = {
  basemap: {
    empty: require('assets/basemapEmpty.png')
  },
  contextual_layer: {
    empty: require('assets/layersEmpty.png')
  }
};

type Props = {|
  +areaTotal: number,
  +baseFiles: Array<Layer>,
  +componentId: string,
  +deleteMappingFile: (id: string, type: LayerType) => Promise<void>,
  +downloadProgress: { [id: string]: LayersCacheStatus },
  +exportLayers: (ids: Array<string>) => Promise<void>,
  +importGFWContent: (LayerType, Layer, boolean) => Promise<void>,
  +importedFiles: Array<Layer>,
  +mappingFileType: LayerType,
  +offlineMode: boolean,
  +renameMappingFile: (id: string, type: LayerType, newName: string) => Promise<void>,
  +showNotConnectedNotification: () => void
|};

type State = {|
  +selectedForExport: Array<string>,
  +inEditMode: boolean,
  +inShareMode: boolean
|};

const ImportButtonKey = 'mappingFile_import';
const ImportButtonRNNElement = {
  id: ImportButtonKey,
  icon: plusIcon
};

class MappingFiles extends Component<Props, State> {
  static options(passProps: { mappingFileType: LayerType }) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
        title: {
          text: i18n.t(`${passProps.mappingFileType === 'basemap' ? 'basemaps' : 'contextualLayers'}.title`)
        },
        rightButtons: [ImportButtonRNNElement]
      }
    };
  }

  scrollView: ?ScrollView;

  shareSheet: ?ShareSheet;

  scrollToBottomOnAppear: boolean = false;

  constructor(props: Props) {
    super(props);

    Navigation.events().bindComponent(this);
    // Set an empty starting state for this object. If empty, we're not in export mode. If there's items in here, export mode is active.
    this.state = {
      selectedForExport: [],
      inEditMode: false,
      inShareMode: false
    };
  }

  i18nKeyFor(key: string): string {
    const base = this.props.mappingFileType === 'basemap' ? 'basemaps' : 'contextualLayers';
    return `${base}.${key}`;
  }

  componentDidMount() {
    trackScreenView(this.props.mappingFileType === 'contextual_layer' ? 'Layers' : 'Basemaps');
  }

  componentDidAppear() {
    if (this.scrollToBottomOnAppear) {
      // $FlowFixMe
      this.scrollView?.scrollToEnd?.({ animated: true });
    }
    this.scrollToBottomOnAppear = false;
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === ImportButtonKey) {
      this.onPressImportFile();
    }
  }

  onPressImportFile = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.ImportMappingFileType',
        passProps: {
          mappingFileType: this.props.mappingFileType,
          onImported: this.onImported,
          popToComponentId: this.props.componentId
        }
      }
    });
  });

  onImported = () => {
    // Have to do this on appear otherwise won't have re-rendered with latest layer!
    this.scrollToBottomOnAppear = true;
  };

  /**
   * Handles the file row being selected while in export mode.
   * Will swap the state for the specified row, to show in the UI if it has been selected or not.
   */
  onFileSelectedForExport = (fileId: string) => {
    this.setState(
      state => {
        if (state.selectedForExport.includes(fileId)) {
          return {
            selectedForExport: [...state.selectedForExport].filter(id => fileId !== id)
          };
        } else {
          const selected = [...state.selectedForExport];
          selected.push(fileId);
          return {
            selectedForExport: selected
          };
        }
      },
      () => {
        this.fetchExportSize(this.state.selectedForExport);
      }
    );
  };

  fetchExportSize = async (layerIds: Array<string>) => {
    const currentFetchId = generateUniqueID();
    this.fetchId = currentFetchId;
    this.setState({
      bundleSize: undefined
    });
    const files = [
      ...this.props.baseFiles.filter(file => layerIds.includes(file.id)),
      ...this.props.importedFiles.filter(file => layerIds.includes(file.id))
    ];
    const basemapType = this.props.mappingFileType === 'basemap';
    const fileSize = await calculateBundleSize({
      basemaps: basemapType ? files : undefined,
      layers: basemapType ? undefined : files
    });
    if (this.fetchId === currentFetchId) {
      this.setState({
        bundleSize: fileSize
      });
    }
  };

  /**
   * Handles the 'export <x> layers' button being tapped.
   *
   * @param  {Array} selectedFiles An array of layer identifiers that have been selected for export.
   */
  onExportFilesTapped = debounceUI(selectedFiles => {
    // TODO: Loading screen while the async function below executed
    this.props.exportLayers(selectedFiles);
    // $FlowFixMe
    this.shareSheet?.setSharing?.(false);
    this.setSharing(false);
  });

  setAllSelected = (selected: boolean) => {
    if (!selected) {
      this.setState({
        selectedForExport: []
      });
      return;
    }

    const allFiles = [...this.props.baseFiles, ...this.props.importedFiles];
    const selectedForExport: Array<string> = allFiles.filter(this._isShareable).map(file => file.id);

    this.setState({
      selectedForExport: selectedForExport
    });
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
          rightButtons: [ImportButtonRNNElement]
        }
      });
    }
  };

  setEditing = (editing: boolean) => {
    this.setState({
      inEditMode: editing
    });

    if (!editing) {
      Navigation.mergeOptions(this.props.componentId, {
        topBar: {
          rightButtons: [ImportButtonRNNElement]
        }
      });
    }
  };

  shareLayer = (file: Layer) => {
    Share.share({
      message: 'Sharing file',
      url: file.url
    });
  };

  confirmMappingFileDeletion = (file: Layer) => {
    let messageKey;
    let titleKey = this.i18nKeyFor('delete.title');

    if (!file.isCustom && !file.isImported) {
      messageKey = this.i18nKeyFor('delete.messageGFWContent');
    } else if (!file.isCustom && file.isImported) {
      // contextual Layer only
      messageKey = this.i18nKeyFor('delete.messageGFWImportedContent');
    } else {
      titleKey = this.i18nKeyFor('delete.titleCustom');
      messageKey = this.i18nKeyFor('delete.messageCustomContent');
    }

    showDeleteConfirmationPrompt(
      i18n.t(titleKey),
      i18n.t(messageKey),
      i18n.t('commonText.cancel'),
      i18n.t('commonText.continue'),
      () => {
        this.props.deleteMappingFile(file.id, this.props.mappingFileType);
      }
    );
  };

  confirmMappingFileRenaming = (file: Layer) => {
    showRenameModal(
      i18n.t(this.i18nKeyFor('rename.title')),
      i18n.t(this.i18nKeyFor('rename.message')),
      file.name ?? '',
      i18n.t('commonText.cancel'),
      i18n.t('commonText.confirm'),
      Constants.layerMaxNameLength,
      newName => {
        const validity = fileNameIsValid(file.id, newName, this.props.importedFiles);

        if (!validity.valid) {
          return;
        }

        this.props.renameMappingFile(file.id, this.props.mappingFileType, newName);
      }
    );
  };

  /**
   * Whether the specified layer can be shared with other users via sharing bundles
   */
  _isShareable = (file: Layer): boolean => {
    if (this.props.mappingFileType === 'basemap') {
      const basemap = ((file: any): Layer);
      return !!basemap.isCustom;
    } else if (this.props.mappingFileType === 'contextual_layer') {
      const layer = ((file: any): Layer);
      if (layer.isCustom) {
        return true;
      }
      const layerMeta = GFW_CONTEXTUAL_LAYERS_METADATA[layer.id];
      return !layerMeta || layerMeta.isShareable;
    }
    return true;
  };

  onInfoPress = debounceUI((file: Layer) => {
    const { name } = file;

    if (!name) {
      return;
    }

    presentInformationModal({
      title: name,
      body: file.description ?? ''
    });
  });

  renderGFWFiles = (files: Array<Layer>) => {
    const { areaTotal, downloadProgress, mappingFileType, offlineMode } = this.props;
    const { inEditMode, inShareMode } = this.state;

    if (files.length === 0) {
      return null;
    }

    return (
      <View>
        <Text style={styles.heading}>{i18n.t(this.i18nKeyFor('gfw'))}</Text>
        {files.map(file => {
          const fileDownloadProgress: Array<LayerCacheData> = Object.values(downloadProgress[file.id] ?? {});
          // If the file is fully downloaded, we should show the refresh icon. Otherwise, we should show the download icon.
          const fileIsFullyDownloaded =
            fileDownloadProgress.filter(area => area.completed && !area.error).length >= areaTotal;
          const fileIsDownloading = fileDownloadProgress.filter(area => area.requested).length > 0;

          // Downloads should be disabled if the file is in-progress, or if this is a basemap we've already downloaded.
          // Basemaps should not be 'refreshed' as Mapbox will handle this internally.
          const disableDownload = fileIsDownloading || (fileIsFullyDownloaded && mappingFileType === 'basemap');

          return (
            <View key={file.id} style={styles.rowContainer}>
              <MappingFileRow
                layerType={mappingFileType}
                layer={file}
                downloaded={fileIsFullyDownloaded}
                downloading={fileIsDownloading}
                inEditMode={inEditMode}
                onDeletePress={() => {
                  this.confirmMappingFileDeletion(file);
                }}
                onPress={() => {
                  if (inShareMode) {
                    this.onFileSelectedForExport(file.id);
                  }
                }}
                onDownloadPress={
                  offlineMode
                    ? this.props.showNotConnectedNotification
                    : disableDownload
                    ? null
                    : async () => {
                        if (fileIsDownloading) {
                          return;
                        }

                        await this.props.importGFWContent(this.props.mappingFileType, file, !fileIsFullyDownloaded);
                      }
                }
                onInfoPress={file.description ? this.onInfoPress.bind(this, file) : undefined}
                selected={inShareMode ? this.state.selectedForExport.includes(file.id) : null}
              />
            </View>
          );
        })}
      </View>
    );
  };

  renderImportedFiles = (files: Array<Layer>) => {
    const { mappingFileType } = this.props;
    const { inEditMode, inShareMode } = this.state;

    if (files.length === 0) {
      if (!inShareMode) {
        return (
          <View>
            <Text style={styles.heading}>{i18n.t(this.i18nKeyFor('imported'))}</Text>
            {this.renderEmptyState()}
          </View>
        );
      }

      return null;
    }

    return (
      <View>
        <Text style={styles.heading}>{i18n.t(this.i18nKeyFor('imported'))}</Text>
        {files.map(file => {
          return (
            <View key={file.id} style={styles.rowContainer}>
              <MappingFileRow
                layerType={mappingFileType}
                layer={file}
                inEditMode={inEditMode}
                onDeletePress={() => {
                  this.confirmMappingFileDeletion(file);
                }}
                onPress={() => {
                  if (inShareMode) {
                    this.onFileSelectedForExport(file.id);
                  }
                }}
                onRenamePress={() => {
                  this.confirmMappingFileRenaming(file);
                }}
                selected={inShareMode ? this.state.selectedForExport.includes(file.id) : null}
              />
            </View>
          );
        })}
      </View>
    );
  };

  renderEmptyState = () => {
    return (
      <View style={styles.containerEmpty}>
        <EmptyState
          actionTitle={i18n.t(this.i18nKeyFor('empty.action'))}
          body={i18n.t(this.i18nKeyFor('empty.body'))}
          icon={icons[this.props.mappingFileType].empty}
          onActionPress={() => {
            showFAQSection(this.props.componentId, i18n.t('settings.aboutFAQ'));
          }}
          title={i18n.t(this.i18nKeyFor('empty.title'))}
        />
      </View>
    );
  };

  renderFilesList = (gfwFiles: Array<Layer>, importedFiles: Array<Layer>) => {
    if (gfwFiles.length === 0 && importedFiles.length === 0) {
      return this.renderEmptyState();
    }

    return (
      <ScrollView
        ref={ref => {
          this.scrollView = ref;
        }}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {this.renderGFWFiles(gfwFiles)}
        {this.renderImportedFiles(importedFiles)}
      </ScrollView>
    );
  };

  render() {
    const { baseFiles, importedFiles, mappingFileType } = this.props;
    const { inShareMode } = this.state;

    const sortedBaseFiles =
      mappingFileType === 'basemap'
        ? [...baseFiles]
        : [...baseFiles].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    const sortedImportedFiles = [...importedFiles].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    const numFiles = sortedBaseFiles.length + sortedImportedFiles.length;
    const hasFiles = numFiles > 0;

    const sharingType = i18n.t(
      mappingFileType === 'basemap' ? 'sharing.type.basemaps' : 'sharing.type.contextualLayers'
    );
    const disabledSharingTitle = i18n.t('sharing.title', {
      type: mappingFileType === 'basemap' ? sharingType : i18n.t('sharing.type.layers')
    });
    const shareableBaseFiles = sortedBaseFiles.filter(this._isShareable);
    const shareableImportedFiles = sortedImportedFiles.filter(this._isShareable);
    const numShareableFiles = shareableBaseFiles.length + shareableImportedFiles.length;
    const hasShareableFiles = numShareableFiles > 0;
    const hasEditableFiles = sortedImportedFiles.filter(file => file.isCustom).length > 0;

    const visibleBaseFiles = inShareMode ? shareableBaseFiles : sortedBaseFiles;
    const visibleImportedFiles = inShareMode ? shareableImportedFiles : sortedImportedFiles;

    // Determine if we're in export mode, and how many layers have been selected to export.
    const totalToExport = this.state.selectedForExport.length;

    return (
      <View style={styles.container}>
        {/* $FlowFixMe add share in progress title */}
        <ShareSheet
          ref={(ref: ?ShareSheet) => {
            this.shareSheet = ref;
          }}
          componentId={this.props.componentId}
          disabled={!hasShareableFiles}
          disableEditButton={!hasEditableFiles}
          editButtonDisabledTitle={i18n.t(this.i18nKeyFor('edit'))}
          editButtonEnabledTitle={i18n.t(this.i18nKeyFor('edit'))}
          onEditingToggled={this.setEditing}
          onSharingToggled={this.setSharing}
          onToggleAllSelected={this.setAllSelected}
          onShare={() => this.onExportFilesTapped(this.state.selectedForExport)}
          selected={totalToExport}
          selectAllCountText={
            numShareableFiles > 1
              ? i18n.t(this.i18nKeyFor('export.many'), { count: numShareableFiles })
              : i18n.t(this.i18nKeyFor('export.one'), { count: 1 })
          }
          showEditButton={hasFiles}
          shareButtonInProgressTitle={i18n.t('sharing.inProgress', { type: sharingType })}
          shareButtonDisabledTitle={disabledSharingTitle}
          shareButtonEnabledTitle={getShareButtonText(sharingType, totalToExport, this.state.bundleSize)}
        >
          {this.renderFilesList(visibleBaseFiles, visibleImportedFiles)}
        </ShareSheet>
      </View>
    );
  }
}

export default MappingFiles;
