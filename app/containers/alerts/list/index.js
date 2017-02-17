import { connect } from 'react-redux';
import { getAlerts } from 'redux-modules/alerts';
import AlertsList from 'components/alerts/list';

function mapStateToProps(state, newProps) {
  return {
    alerts: state.alerts.data[newProps.areaId] || []
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    },
    getAlerts: (areaId) => {
      dispatch(getAlerts(areaId));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertsList);
