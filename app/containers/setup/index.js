import { connect } from 'react-redux';
import { navigatePush, navigatePop, showNavHeader } from 'redux-modules/navigation';

import Setup from 'components/setup';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    countries: state.countries.data
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
    showNavHeader: (action) => {
      dispatch(showNavHeader(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
