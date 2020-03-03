// @flow
import type { State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { setMapWalkthroughSeen } from 'redux-modules/app';

import MapWalkthrough from 'components/map/walkthrough';

function mapStateToProps(state: State) {
  return {};
}

function mapDispatchToProps(dispatch: *) {
  return bindActionCreators(
    {
      setMapWalkthroughSeen
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapWalkthrough);
