import { connect } from 'react-redux';
import { navigatePush, navigatePop } from 'redux-modules/navigation';
import Dashboard from 'components/dashboard';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    navigate: (action) => {
      dispatch(navigatePush(action));
    },
    navigateBack: (action) => {
      dispatch(navigatePop(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
