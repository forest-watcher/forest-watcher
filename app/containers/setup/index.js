import { connect } from 'react-redux';
import { initSetup } from 'redux-modules/setup';
import { setShowLegend } from 'redux-modules/app';

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
    },
    setShowLegend: (hasAlerts) => {
      dispatch(setShowLegend(hasAlerts));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setup);
