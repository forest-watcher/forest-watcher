import { connect } from 'react-redux';
import { getAlerts } from 'redux-modules/alerts';
import Alerts from 'components/alerts';

function mapStateToProps(state) {
  return {
    data: state.alerts.data
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    },
    fetchData: (action) => {
      dispatch(getAlerts(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Alerts);
