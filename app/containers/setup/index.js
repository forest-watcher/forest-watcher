import { connect } from 'react-redux';
import { withNavigation, NavigationActions } from 'react-navigation';

import Setup from 'components/setup';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    countries: state.countries.data
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    onFinishSetup: () => {
      const action = NavigationActions.reset({
        index: 0,
        actions: [{ type: 'Navigate', routeName: 'Dashboard' }]
      });
      navigation.dispatch(action);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(Setup));
