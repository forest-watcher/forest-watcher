// @flow
import type { LayerType } from 'types/sharing.types';
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { File } from 'types/file.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clearImportBasemapState, importBasemap } from 'redux-modules/basemaps';
import { clearImportContextualLayerState, importContextualLayer } from 'redux-modules/layers';

import ImportMappingFileRename from 'components/settings/mapping-files/import/rename';

type OwnProps = {|
  +componentId: string,
  mappingFileType: LayerType,
  file: File
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const imported = ownProps.mappingFileType === 'basemap' ? state.basemaps.importedBasemaps : state.layers.imported;
  const error = ownProps.mappingFileType === 'basemap' ? state.basemaps.importError : state.layers.importError;
  const importing = ownProps.mappingFileType === 'basemap' ? state.basemaps.importing : state.layers.importingLayer;

  return {
    existing: imported,
    importError: error,
    importing: importing
  };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) =>
  bindActionCreators(
    {
      clearState: ownProps.mappingFileType === 'basemap' ? clearImportBasemapState : clearImportContextualLayerState,
      import: ownProps.mappingFileType === 'basemap' ? importBasemap : importContextualLayer
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(ImportMappingFileRename);
