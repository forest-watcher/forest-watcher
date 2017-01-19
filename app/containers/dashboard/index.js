import { connect } from 'react-redux';
import { navigatePush, navigatePop, toggleHeader } from 'redux-modules/navigation';
import { setLoginModal } from 'redux-modules/user';
import Dashboard from 'components/dashboard';

function mapStateToProps(state) {
  return {
    loggedIn: state.user.loggedIn
  };
}

function mapDispatchToProps(dispatch) {
  return {
    navigate: (action) => {
      dispatch(navigatePush(action));
    },
    navigateBack: (action) => {
      dispatch(navigatePop(action));
    },
    onToggleHeader: (action) => {
      dispatch(toggleHeader(action));
    },
    setLoginModal: (action) => {
      dispatch(setLoginModal(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
