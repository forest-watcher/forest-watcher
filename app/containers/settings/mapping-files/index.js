// @flow
import type { Basemap } from 'types/basemaps.types';
import type { LayerType } from 'types/sharing.types';
import type { File } from 'types/file.types';
import type { ContextualLayer } from 'types/layers.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import MappingFiles from 'components/settings/mapping-files';

import { trackSharedContent } from 'helpers/analytics';
import { deleteLayerFile } from 'helpers/layer-store/deleteLayerFiles';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

import { deleteBasemap, renameBasemap } from 'redux-modules/basemaps';
import { deleteLayer, renameLayer, importGFWContextualLayer } from 'redux-modules/layers';
import { unselectDeletedBasemap } from 'redux-modules/layerSettings';

import { GFW_BASEMAPS } from 'config/constants';

type OwnProps = {|
  +componentId: string,
  +mappingFileType: LayerType
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  let baseFiles: Array<ContextualLayer | Basemap> =
    ownProps.mappingFileType === 'contextual_layer' ? state.layers.data || [] : GFW_BASEMAPS;
  if (ownProps.mappingFileType === 'contextual_layer') {
    const importedGFWLayers = state.layers.imported.filter(layer => layer.isGFW);
    baseFiles = baseFiles.concat(importedGFWLayers);
  }
  const importedFiles: Array<File> =
    ownProps.mappingFileType === 'contextual_layer'
      ? state.layers.imported.filter(layer => !layer.isGFW)
      : state.basemaps.importedBasemaps;

  return {
    areaTotal: state.areas.data.length,
    baseFiles,
    downloadedLayerProgress: state.layers.downloadedLayerProgress,
    importedFiles
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps) {
  return {
    deleteMappingFile: async (id: string, type: LayerType) => {
      await deleteLayerFile(id, type);

      if (type === 'basemap') {
        await dispatch(deleteBasemap(id));
        await dispatch(unselectDeletedBasemap(id));
      } else {
        await dispatch(deleteLayer(id));
      }
    },
    exportLayers: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux(
          ownProps.mappingFileType === 'basemap'
            ? {
                basemapIds: ids
              }
            : {
                layerIds: ids
              }
        )
      );
      trackSharedContent(ownProps.mappingFileType === 'basemap' ? 'basemap' : 'layer');
      await shareBundle(outputPath);
    },
    importGFWContextualLayer: async (layer: ContextualLayer, onlyNonDownloadedAreas: boolean = false) => {
      await dispatch(importGFWContextualLayer(layer, onlyNonDownloadedAreas));
    },
    renameMappingFile: async (id: string, type: LayerType, newName: string) => {
      if (type === 'basemap') {
        await dispatch(renameBasemap(id, newName));
      } else {
        await dispatch(renameLayer(id, newName));
      }
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(MappingFiles);
