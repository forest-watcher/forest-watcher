import { connect } from 'react-redux';
import { navigatePop } from 'redux-modules/navigation';
import { initSetup } from 'redux-modules/setup';

import Setup from 'components/setup';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    initSetup: () => {
      dispatch(initSetup());
    },
    onFinishSetup: (action) => {
      dispatch(navigatePop(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
