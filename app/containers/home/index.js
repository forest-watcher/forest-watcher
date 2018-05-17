// @flow
import type { State } from 'types/store.types';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { syncApp, setLanguage, setAppSynced } from 'redux-modules/app';
import { getLanguage } from 'helpers/language';
import { getTotalActionsPending } from 'helpers/sync';

import Home from 'components/home';

function mapStateToProps(state: State) {
  return {
    hasAreas: !!state.areas.data.length,
    isAppSynced: state.app.synced,
    loggedIn: state.user.loggedIn,
    token: state.user.token,
    actionsPending: getTotalActionsPending(state),
    languageChanged: state.app.language !== getLanguage()
  };
}

const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  syncApp,
  setAppSynced,
  setLanguageDispatch: () => setLanguage(getLanguage())
}, dispatch);

function mergeProps({ languageChanged, ...stateProps }, { setLanguageDispatch, ...dispatchProps }, ownProps) {
  return {
    ...ownProps,
    ...dispatchProps,
    ...stateProps,
    setLanguage: () => (languageChanged && setLanguageDispatch())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Home);
