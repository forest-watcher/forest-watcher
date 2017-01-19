import { connect } from 'react-redux';
import { navigatePush, navigatePop } from 'redux-modules/navigation';
import App from 'components/app';

function mapStateToProps(state) {
  return {
    navigationRoute: state.navigation
  };
}

function mapDispatchToProps(dispatch) {
  return {
    navigate: (action) => {
      dispatch(navigatePush(action));
    },
    navigateBack: () => {
      dispatch(navigatePop());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
