import { connect } from 'react-redux';
import { setLanguage, setSyncModal, setSyncSkip } from 'redux-modules/app';
import { setLoginStatus } from 'redux-modules/user';
import { getLanguage } from 'helpers/language';
import { isSyncFinished } from 'helpers/sync';

import Home from 'components/home';

function mapStateToProps(state) {
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

function mapDispatchToProps(dispatch) {
  return {
    setLoginStatus: (status) => {
      dispatch(setLoginStatus(status));
    },
    setLanguageDispatch: () => {
      dispatch(setLanguage(getLanguage()));
    },
    setSyncModal: open => dispatch(setSyncModal(open)),
    setSyncSkip: open => dispatch(setSyncSkip(open))
  };
}

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
