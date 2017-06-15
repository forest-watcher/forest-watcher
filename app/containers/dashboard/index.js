import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import { setSyncModal } from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { getTotalActionsPending } from 'helpers/sync';

function mapStateToProps(state) {
  return {
    actionsPending: getTotalActionsPending(state),
    syncModalOpen: state.app.syncModalOpen
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createReport: (report) => {
      dispatch(createReport(report));
    },
    setSyncModal: open => dispatch(setSyncModal(open))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
