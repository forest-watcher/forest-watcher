import { connect } from 'react-redux';
import { NavigationActions } from 'react-navigation';
import { initSetup } from 'redux-modules/setup';

import Setup from 'components/setup';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    initSetup: () => {
      dispatch(initSetup());
    },
    goBack: () => {
      navigation.goBack();
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
