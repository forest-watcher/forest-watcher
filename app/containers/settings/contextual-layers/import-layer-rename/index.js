// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import type { File } from 'types/file.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clearImportContextualLayerState, importContextualLayer } from 'redux-modules/layers';

import ImportLayerRename from 'components/settings/contextual-layers/import-layer-rename';

type OwnProps = {|
  +componentId: string,
  file: File
|};

function mapStateToProps(state: State) {
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
)(ImportLayerRename);
