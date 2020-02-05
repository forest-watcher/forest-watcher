// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { syncApp, setAppSynced } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';

import Home from 'components/home';

function mapStateToProps(state: State) {
  return {
    hasAreas: !!state.areas.data.length,
    isAppSynced: state.app.synced,
    loggedIn: state.user.loggedIn,
    token: state.user.token,
    actionsPending: getTotalActionsPending(state)
  };
}

const mapDispatchToProps = (dispatch: *) =>
  bindActionCreators(
    {
      syncApp,
      setAppSynced
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
