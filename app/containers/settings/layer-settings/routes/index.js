// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DEFAULT_LAYER_SETTINGS } from 'redux-modules/layerSettings';
import RoutesLayerSettings from 'components/settings/layer-settings/routes';

function mapStateToProps(state: State, ownProps) {
  return {
    featureId: ownProps.featureId,
    routesLayerSettings: state.layerSettings?.[ownProps.featureId]?.routes || DEFAULT_LAYER_SETTINGS.routes
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RoutesLayerSettings);
