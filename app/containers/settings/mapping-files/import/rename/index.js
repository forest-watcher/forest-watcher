// @flow
import type { LayerType } from 'types/sharing.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { File } from 'types/file.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clearImportContextualLayerState, importLayer } from 'redux-modules/layers';

import ImportMappingFileRename from 'components/settings/mapping-files/import/rename';

type OwnProps = {|
  +componentId: string,
  mappingFileType: LayerType,
  onImported: () => void,
  file: File
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const imported = state.layers.imported.filter(importedLayer => importedLayer.type === ownProps.mappingFileType);
  const error = state.layers.importError;
  const importing = state.layers.importingLayer;

  return {
    existing: imported,
    importError: error,
    importing: importing
  };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) =>
  bindActionCreators(
    {
      clearState: clearImportContextualLayerState,
      import: importLayer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportMappingFileRename);
