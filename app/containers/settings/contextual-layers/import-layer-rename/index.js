// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { clearImportContextualLayerState, importContextualLayer } from 'redux-modules/layers';

import ImportLayerRename from 'components/settings/contextual-layers/import-layer-rename';

function mapStateToProps(state: State) {
  return {
    existingLayers: state.layers.imported,
    importError: state.layers.importError,
    importingLayer: state.layers.importingLayer
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      importContextualLayer,
      clearImportContextualLayerState
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportLayerRename);
