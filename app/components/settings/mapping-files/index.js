// @flow
import type { Basemap } from 'types/basemaps.types';
import type { MappingFileType } from 'types/common.types';
import type { File } from 'types/file.types';
import type { ContextualLayer } from 'types/layers.types';

import React, { Component } from 'react';
import { View, ScrollView, Share, Text } from 'react-native';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import i18n from 'i18next';

import EmptyState from 'components/common/empty-state';
import ShareSheet from 'components/common/share';
import ActionsRow from 'components/common/actions-row';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import tracker from 'helpers/googleAnalytics';
import { formatBytes } from 'helpers/data';

import styles from './styles';
import MappingFileRow from 'components/settings/mapping-files/mapping-file-row';

const plusIcon = require('assets/add.png');
const icons = {
  basemaps: {
    empty: require('assets/basemapEmpty.png'),
    placeholder: require('assets/basemap_placeholder.png')
  },
  contextualLayers: {
    empty: require('assets/layersEmpty.png'),
    placeholder: require('assets/layerPlaceholder.png')
  }
};

type Props = {|
  +baseFiles: Array<Basemap | ContextualLayer>,
  +componentId: string,
  +exportLayers: (ids: Array<string>) => Promise<void>,
  +importedFiles: Array<ContextualLayer>,
  +mappingFileType: MappingFileType
|};

type State = {|
  +selectedForExport: Array<string>,
  +inShareMode: boolean
|};

const ImportButtonKey = 'mappingFile_import';
const ImportButtonRNNElement = {
  id: ImportButtonKey,
  icon: plusIcon
};

class MappingFiles extends Component<Props, State> {
  static options(passProps: { mappingFileType: MappingFileType }) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        },
        title: {
          text: i18n.t(`${passProps.mappingFileType}.title`)
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
      inShareMode: false
    };
  }

  i18nKeyFor(key: string): string {
    return `${this.props.mappingFileType}.${key}`;
  }

  componentDidMount() {
    tracker.trackScreenView(this.props.mappingFileType === 'contextualLayers' ? 'Layers' : 'Basemaps');
  }

  componentDidAppear() {
    if (this.scrollToBottomOnAppear) {
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
    this.setState(state => {
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
    });
  };

  /**
   * Handles the 'export <x> layers' button being tapped.
   *
   * @param  {Array} selectedFiles An array of layer identifiers that have been selected for export.
   */
  onExportFilesTapped = debounceUI(selectedFiles => {
    // TODO: Loading screen while the async function below executed
    this.props.exportLayers(selectedFiles);
    this.shareSheet?.setSharing?.(false);
    this.setSharing(false);
  });

  setAllSelected = (selected: boolean) => {
    this.setState({
      selectedForExport: selected ? this.props.baseFiles.map(layer => layer.id) : []
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

  shareLayer = (file: ContextualLayer) => {
    Share.share({
      message: 'Sharing file',
      url: file.url
    });
  };

  renderGFWFiles = () => {
    const { baseFiles, mappingFileType } = this.props;
    const { inShareMode } = this.state;
    if (baseFiles.length === 0) {
      return null;
    }
    return (
      <View>
        <Text style={styles.heading}>{i18n.t(this.i18nKeyFor('gfw'))}</Text>
        {baseFiles.map(file => {
          return (
            <View key={file.id} style={styles.rowContainer}>
              <MappingFileRow
                onPress={() => {
                  if (inShareMode) {
                    this.onFileSelectedForExport(file.id);
                  }
                }}
                onDownloadPress={() => {}}
                style={styles.rowContent}
                image={file.image ?? icons[mappingFileType].placeholder}
                title={i18n.t(file.name)}
                subtitle={'128 mb'}
                selected={inShareMode ? this.state.selectedForExport.includes(file.id) : null}
              />
            </View>
          );
        })}
      </View>
    );
  };

  renderImportedFiles = () => {
    const { importedFiles, mappingFileType } = this.props;
    if (importedFiles.length === 0) {
      if (mappingFileType === 'basemaps') {
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
        {importedFiles.map((file, index) => {
          return (
            <ActionsRow
              onPress={this.shareLayer.bind(this, file)}
              style={styles.rowContent}
              imageSrc={icons[mappingFileType].placeholder}
              key={index}
            >
              <Text style={styles.rowLabel}>{file.name}</Text>
              {file.size != null && <Text style={styles.rowLabel}>{formatBytes(file.size)}</Text>}
            </ActionsRow>
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
          onActionPress={() => {}}
          title={i18n.t(this.i18nKeyFor('empty.title'))}
        />
      </View>
    );
  };

  renderFilesList = () => {
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
        {this.renderGFWFiles()}
        {this.renderImportedFiles()}
      </ScrollView>
    );
  };

  render() {
    const { baseFiles, importedFiles, mappingFileType } = this.props;
    // Determine if we're in export mode, and how many layers have been selected to export.
    const totalToExport = this.state.selectedForExport.length;
    const totalFiles = importedFiles.length + baseFiles.length;
    const hasFiles = totalFiles > 0;

    return (
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
          shareButtonDisabledTitle={i18n.t(this.i18nKeyFor('share'))}
          enabled={mappingFileType === 'contextualLayers' || totalToExport > 0}
          onShare={() => {
            this.onExportFilesTapped(this.state.selectedForExport);
          }}
          onSharingToggled={this.setSharing}
          onToggleAllSelected={this.setAllSelected}
          ref={(ref: ?ShareSheet) => {
            this.shareSheet = ref;
          }}
          selected={totalToExport}
          selectAllCountText={
            totalFiles > 1
              ? i18n.t(this.i18nKeyFor('export.many'), { count: totalFiles })
              : i18n.t(this.i18nKeyFor('export.one'), { count: 1 })
          }
          shareButtonEnabledTitle={
            totalToExport > 0
              ? totalToExport === 1
                ? i18n.t(this.i18nKeyFor('export.oneAction'), { count: 1 })
                : i18n.t(this.i18nKeyFor('export.manyAction'), { count: totalToExport })
              : i18n.t(this.i18nKeyFor('export.noneSelected'))
          }
        >
          {hasFiles ? this.renderFilesList() : this.renderEmptyState()}
        </ShareSheet>
      </View>
    );
  }
}

export default MappingFiles;
