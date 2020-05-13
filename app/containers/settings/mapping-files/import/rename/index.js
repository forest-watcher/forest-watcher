// @flow
import type { MappingFileType } from 'types/common.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { File } from 'types/file.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clearImportContextualLayerState, importContextualLayer } from 'redux-modules/layers';

import ImportMappingFileRename from 'components/settings/mapping-files/import/rename';

type OwnProps = {|
  +componentId: string,
  mappingFileType: MappingFileType,
  file: File
|};

function mapStateToProps(state: State) {
  // TODO: When completing redux code, update these to use existing basemaps etc
  return {
    existingLayers: state.layers.imported,
    importError: state.layers.importError,
    importingLayer: state.layers.importingLayer
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      importContextualLayer,
      clearImportContextualLayerState
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportMappingFileRename);
