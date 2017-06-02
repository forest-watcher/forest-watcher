import { connect } from 'react-redux';
import { setLanguage } from 'redux-modules/app';
import { getUser, setLoginStatus } from 'redux-modules/user';
import { getLanguage } from 'helpers/language';
import Home from 'components/home';

function mapStateToProps(state) {
  return {
    hasAreas: state.areas.data && state.areas.data.length > 0,
    areasSynced: state.areas.synced,
    setupComplete: state.app.setupComplete,
    user: state.user,
    languageChanged: state.app.language !== getLanguage(),
    userData: state.user.data && Object.keys(state.user.data).length > 0
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getUserDispatch: () => {
      dispatch(getUser());
    },
    setLoginStatus: (status) => {
      dispatch(setLoginStatus(status));
    },
    setLanguageDispatch: () => {
      dispatch(setLanguage(getLanguage()));
    }
  };
}

function mergeProps({ languageChanged, userData, ...stateProps }, { setLanguageDispatch, getUserDispatch, ...dispatchProps }, ownProps) {
  return {
    ...ownProps,
    ...dispatchProps,
    ...stateProps,
    setLanguage: () => (languageChanged && setLanguageDispatch()),
    getUser: () => (userData && getUserDispatch())
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Home);
