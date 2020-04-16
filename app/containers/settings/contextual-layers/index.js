// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ContextualLayers from 'components/settings/contextual-layers';

function mapStateToProps(state: State) {
  return {
    baseApiLayers: state.layers.data || [],
    importedLayers: state.layers.imported
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextualLayers);
