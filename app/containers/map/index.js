import { connect } from 'react-redux';
import { createReport } from 'redux-modules/reports';
import { NavigationActions } from 'react-navigation';
import Map from 'components/map';

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    createReport: (name, position) => {
      dispatch(createReport(name, position));
    },
    navigateReset: (routeName, params) => {
      const action = NavigationActions.reset({
        index: 2,
        actions: [
          { type: 'Navigate', routeName: 'Dashboard' },
          { type: 'Navigate', routeName: 'Alerts' },
          { type: 'Navigate', routeName, params }
        ]
      });
      navigation.dispatch(action);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Map);
