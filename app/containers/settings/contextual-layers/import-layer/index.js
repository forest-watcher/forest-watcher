// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { importContextualLayer } from 'redux-modules/layers';

import ImportLayer from 'components/settings/contextual-layers/import-layer';

function mapStateToProps(state: State) {
  return {
  	importError: state.layers.importError
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
