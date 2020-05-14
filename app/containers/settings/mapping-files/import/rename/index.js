// @flow
import type { MappingFileType } from 'types/common.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { File } from 'types/file.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clearImportBasemapState, importBasemap } from 'redux-modules/basemaps';
import { clearImportContextualLayerState, importContextualLayer } from 'redux-modules/layers';

import ImportMappingFileRename from 'components/settings/mapping-files/import/rename';

type OwnProps = {|
  +componentId: string,
  mappingFileType: MappingFileType,
  file: File
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const imported = ownProps.mappingFileType === 'basemaps' ? state.basemaps.importedBasemaps : state.layers.imported;
  const error = ownProps.mappingFileType === 'basemaps' ? state.basemaps.importError : state.layers.importError;
  const importing = ownProps.mappingFileType === 'basemaps' ? state.basemaps.importing : state.layers.importingLayer;

  return {
    existing: imported,
    importError: error,
    importing: importing
  };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) =>
  bindActionCreators(
    {
      clearState: ownProps.mappingFileType === 'basemaps' ? clearImportBasemapState : clearImportContextualLayerState,
      import: ownProps.mappingFileType === 'basemaps' ? importBasemap : importContextualLayer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportMappingFileRename);
