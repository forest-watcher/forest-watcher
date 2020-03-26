// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { importContextualLayer } from 'redux-modules/layers';

import ContextualLayers from 'components/settings/contextual-layers';

function mapStateToProps(state: State) {
  return {
  	importedLayers: state.layers.imported
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
)(ContextualLayers);
