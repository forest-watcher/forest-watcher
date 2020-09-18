// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import { DEFAULT_LAYER_SETTINGS, getActiveBasemap } from 'redux-modules/layerSettings';
import { connect } from 'react-redux';
import DrawAreas from 'components/setup/draw-areas';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State, ownProps: OwnProps) {
  const featureId = ownProps.featureId || 'newAreaFeatureId';
  const layerSettings = state.layerSettings?.[featureId] || DEFAULT_LAYER_SETTINGS;

  return {
    basemap: getActiveBasemap(featureId, state),
    layerSettings
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({}, dispatch);

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(DrawAreas);
