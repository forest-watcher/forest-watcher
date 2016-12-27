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
    onNavigate: (action) => {
      if (action.type === 'back') {
        dispatch(navigatePop(action));
      } else {
        dispatch(navigatePush(action));
      }
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
