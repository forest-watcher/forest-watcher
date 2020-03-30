// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { importContextualLayer } from 'redux-modules/layers';

import ImportLayer from 'components/settings/contextual-layers/import-layer';

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
      importContextualLayer
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportLayer);
