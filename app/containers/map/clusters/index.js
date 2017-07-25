import { connect } from 'react-redux';
import Clusters from 'components/map/clusters';

function mapStateToProps(state) {
  const reportedAlerts = state.alerts.reported;
  return {
    reportedAlerts
  };
}

export default connect(
  mapStateToProps,
  null
)(Clusters);
