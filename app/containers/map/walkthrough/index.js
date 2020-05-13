// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { setMapWalkthroughSeen } from 'redux-modules/app';

import MapWalkthrough from 'components/map/walkthrough';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      setMapWalkthroughSeen
    },
    dispatch
  );
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(MapWalkthrough);
