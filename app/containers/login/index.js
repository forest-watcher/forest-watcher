import { connect } from 'react-redux';
import { navigatePush, navigatePop, toggleHeader } from 'redux-modules/navigation';
import Login from 'components/login';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    onNavigate: (action) => {
      dispatch(navigatePush(action));
    },
    onBack: (action) => {
      dispatch(navigatePop(action));
    },
    onToggleHeader: (action) => {
      dispatch(toggleHeader(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
