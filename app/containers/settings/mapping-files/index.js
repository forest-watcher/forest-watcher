// @flow
import type { Basemap } from 'types/basemaps.types';
import type { MappingFileType } from 'types/common.types';
import type { File } from 'types/file.types';
import type { ContextualLayer } from 'types/layers.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';

import MappingFiles from 'components/settings/mapping-files';
import exportBundleFromRedux from 'helpers/sharing/exportBundleFromRedux';
import shareBundle from 'helpers/sharing/shareBundle';

import { GFW_BASEMAPS } from 'config/constants';

type OwnProps = {|
  +componentId: string,
  +mappingFileType: MappingFileType
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const baseFiles: Array<ContextualLayer | Basemap> =
    ownProps.mappingFileType === 'contextualLayers' ? state.layers.data || [] : GFW_BASEMAPS;
  const importedFiles: Array<File> =
    ownProps.mappingFileType === 'contextualLayers' ? state.layers.imported : state.basemaps.importedBasemaps;

  return {
    baseFiles,
    importedFiles
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
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
