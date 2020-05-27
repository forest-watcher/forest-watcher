// @flow
import type { Basemap } from 'types/basemaps.types';
import type { LayerType } from 'types/sharing.types';
import type { File } from 'types/file.types';
import type { ContextualLayer } from 'types/layers.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import MappingFiles from 'components/settings/mapping-files';

import { deleteLayerFile } from 'helpers/layer-store/deleteLayerFiles';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

import { deleteBasemap } from 'redux-modules/basemaps';
import { deleteLayer } from 'redux-modules/layers';

import { GFW_BASEMAPS } from 'config/constants';

type OwnProps = {|
  +componentId: string,
  +mappingFileType: LayerType
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const baseFiles: Array<ContextualLayer | Basemap> =
    ownProps.mappingFileType === 'contextual_layer' ? state.layers.data || [] : GFW_BASEMAPS;
  const importedFiles: Array<File> =
    ownProps.mappingFileType === 'contextual_layer' ? state.layers.imported : state.basemaps.importedBasemaps;

  return {
    baseFiles,
    importedFiles
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    deleteLayer: async (id: string, type: LayerType) => {
      await deleteLayerFile(id, type);

      if (type === 'basemap') {
        await dispatch(deleteBasemap(id));
      } else {
        await dispatch(deleteLayer(id));
      }
    },
    exportLayers: async (ids: Array<string>) => {
      const outputPath = await dispatch(
        exportBundleFromRedux({
          layerIds: ids
        })
      );
      await shareBundle(outputPath);
    }
  };
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(MappingFiles);
