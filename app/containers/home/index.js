// @flow
import type { State } from 'types/store';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setLanguage, setSyncModal, startApp } from 'redux-modules/app';
import { getLanguage } from 'helpers/language';
import { isSyncFinished } from 'helpers/sync';

import Home from 'components/home';

function mapStateToProps(state: State) {
  return {
    hasAreas: !!state.areas.data.length,
    syncFinished: isSyncFinished(state),
    loggedIn: state.user.loggedIn,
    token: state.user.token,
    languageChanged: state.app.language !== getLanguage(),
    syncModalOpen: state.app.syncModalOpen,
    syncSkip: state.app.syncSkip
  };
}
const mapDispatchToProps = (dispatch: *) => bindActionCreators({
  startApp,
  setSyncModal,
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
