import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import { createReport } from 'redux-modules/reports';
import { getTotalActionsPending } from 'helpers/sync';

function mapStateToProps(state) {
  return {
    actionsPending: getTotalActionsPending(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createReport: (name, position) => {
      dispatch(createReport(name, position));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
