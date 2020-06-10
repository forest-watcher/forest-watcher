// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';
import { bindActionCreators } from 'redux';
import { getActiveBasemap } from 'redux-modules/layerSettings';
import { connect } from 'react-redux';
import DrawAreas from 'components/setup/draw-areas';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  const basemap = getActiveBasemap('newAreaFeatureId');
  return {
    basemap,
    mapWalkthroughSeen: state.app.mapWalkthroughSeen
  };
}

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({}, dispatch);

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(DrawAreas);
