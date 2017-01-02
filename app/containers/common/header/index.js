import { connect } from 'react-redux';
import { navigatePush, navigatePop } from 'redux-modules/navigation';
import Header from 'components/common/header';

function mapStateToProps(state) {
  return {
    navigation: state.navigation
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onNavigate: (action) => {
      dispatch(navigatePush(action));
    },
    onBack: (action) => {
      dispatch(navigatePop(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);
