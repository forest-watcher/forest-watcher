// @flow
import type { LayerType } from 'types/sharing.types';
import type { Layer } from 'types/layers.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import MappingFiles from 'components/settings/mapping-files';

import { trackSharedContent } from 'helpers/analytics';
import { deleteLayerFile } from 'helpers/layer-store/deleteLayerFiles';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

import { showNotConnectedNotification } from 'redux-modules/app';
import { deleteLayer, renameLayer } from 'redux-modules/layers';
import { deleteMapboxOfflinePacks, importGFWContent } from 'redux-modules/layers/downloadLayer';
import { unselectDeletedBasemap } from 'redux-modules/layerSettings';

import { GFW_BASEMAPS } from 'config/constants';

type OwnProps = {|
  +componentId: string,
  +mappingFileType: LayerType
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const mappingFileType = ownProps.mappingFileType;

  let baseFiles: Array<Layer> = mappingFileType === 'contextual_layer' ? state.layers.data || [] : GFW_BASEMAPS;
  if (mappingFileType === 'contextual_layer') {
    const importedGFWLayers = state.layers.imported.filter(layer => layer.type === mappingFileType && !layer.isCustom);
    baseFiles = baseFiles.concat(importedGFWLayers);
  }

  const importedFiles: Array<Layer> = state.layers.imported.filter(
    layer => layer.type === mappingFileType && layer.isCustom
  );

  return {
    areaTotal: state.areas.data.length,
    baseFiles,
    downloadProgress: state.layers.downloadedLayerProgress,
    importedFiles,
    offlineMode: state.app.offlineMode
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  const mappingFileType = ownProps.mappingFileType;

  return {
    deleteMappingFile: async (id: string, type: LayerType) => {
      await deleteLayerFile(id, type);

      await dispatch(deleteLayer(id));

      if (type === 'basemap') {
        await dispatch(deleteMapboxOfflinePacks(id));
        await dispatch(unselectDeletedBasemap(id));
      }
    },
    exportLayers: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux(
          mappingFileType === 'basemap'
            ? {
                basemapIds: ids
              }
            : {
                layerIds: ids
              }
        )
      );
      trackSharedContent(mappingFileType === 'basemap' ? 'basemap' : 'layer');
      await shareBundle(outputPath);
    },
    importGFWContent: async (contentType: LayerType, content: Layer, onlyNonDownloadedAreas: boolean = false) => {
      await dispatch(importGFWContent(contentType, content, onlyNonDownloadedAreas));
    },
    renameMappingFile: async (id: string, type: LayerType, newName: string) => {
      await dispatch(renameLayer(id, newName));
    },
    showNotConnectedNotification: () => {
      dispatch(showNotConnectedNotification());
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(MappingFiles);
