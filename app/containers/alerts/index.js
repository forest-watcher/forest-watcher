import { connect } from 'react-redux';
import { navigatePush } from 'redux-modules/navigation';
import { getAlerts } from 'redux-modules/alerts';
import Alerts from 'components/alerts';

function mapStateToProps(state) {
  return {
    data: state.alerts.data
  };
}

function mapDispatchToProps(dispatch) {
  return {
    navigate: (action) => {
      dispatch(navigatePush(action));
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
