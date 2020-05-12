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

const plusIcon = require('assets/add.png');
const icons = {
  baseMaps: {
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
  +importedFiles: Array<File>,
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

  shareSheet: ?ShareSheet;

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
    tracker.trackScreenView(this.props.mappingFileType === 'contextualLayers' ? 'Layers' : 'Base Maps');
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
          popToComponentId: this.props.componentId
        }
      }
    });
  });

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
    // todo: Add back in once we have redux state for layers
    // this.setState({
    //   selectedForExport: selected ? this.props.layers.map(layer => layer.id) : []
    // });
  };

  setSharing = (sharing: boolean) => {
    if (this.props.mappingFileType === 'baseMaps') {
      console.warn('3SC', 'Exporting basemaps is not yet supported');
      return;
    }

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

  shareLayer = (file: File) => {
    Share.share({
      message: 'Sharing file',
      url: file.uri
    });
  };

  renderGFWFiles = () => {
    const { baseFiles, mappingFileType } = this.props;
    if (baseFiles.length === 0) {
      return null;
    }
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t(this.i18nKeyFor('gfw'))}</Text>
        </View>
        {baseFiles.map((file, index) => {
          return (
            <ActionsRow
              style={styles.rowContent}
              imageSrc={file.image ?? icons[mappingFileType].placeholder}
              key={index}
            >
              <Text style={styles.rowLabel}>{i18n.t(file.name)}</Text>
              {file.size != null && <Text style={styles.rowLabel}>{formatBytes(file.size)}</Text>}
            </ActionsRow>
          );
        })}
      </View>
    );
  };

  renderImportedFiles = () => {
    const { importedFiles, mappingFileType } = this.props;
    if (importedFiles.length === 0) {
      if (mappingFileType === 'baseMaps') {
        return (
          <View>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>{i18n.t(this.i18nKeyFor('imported'))}</Text>
            </View>
            {this.renderEmptyState()}
          </View>
        );
      }

      return null;
    }

    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t(this.i18nKeyFor('imported'))}</Text>
        </View>
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
    //todo: add this back in once we have redux state for layers!
    const { baseFiles, importedFiles, mappingFileType } = this.props;
    // Determine if we're in export mode, and how many layers have been selected to export.
    const totalToExport = this.state.selectedForExport.length;

    //todo: add this back in once we have redux state for layers!
    const totalFiles = importedFiles.length + baseFiles.length;

    //todo: add this back in once we have redux state for layers!
    const hasFiles = totalFiles > 0;

    return (
      <View style={styles.container}>
        <ShareSheet
          componentId={this.props.componentId}
          shareButtonDisabledTitle={i18n.t(this.i18nKeyFor('share'))}
          disabled={mappingFileType === 'baseMaps'} // remove this once sharing work is completed
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
