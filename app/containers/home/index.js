// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { syncApp, setAppSynced } from 'redux-modules/app';
import { getTotalActionsPending } from 'helpers/sync';

import Home from 'components/home';

type OwnProps = {|
  +componentId: string
|};

function mapStateToProps(state: State) {
  return {
    hasAreas: !!state.areas.data.length,
    isAppSynced: state.app.synced,
    loggedIn: state.user.loggedIn,
    actionsPending: getTotalActionsPending(state)
  };
}

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      syncApp,
      setAppSynced
    },
    dispatch
  );

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Home);
