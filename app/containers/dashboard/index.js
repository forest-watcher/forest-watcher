import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import { setSyncModal, setPristine } from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { getTotalActionsPending } from 'helpers/sync';
import { updateSelectedIndex } from 'redux-modules/areas';

function mapStateToProps(state) {
  return {
    actionsPending: getTotalActionsPending(state),
    syncModalOpen: state.app.syncModalOpen,
    syncSkip: state.app.syncSkip,
    pristine: state.app.pristine
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createReport: (report) => {
      dispatch(createReport(report));
    },
    setPristine: (pristine) => {
      dispatch(setPristine(pristine));
    },
    setSyncModal: open => dispatch(setSyncModal(open)),
    updateSelectedIndex: index => dispatch(updateSelectedIndex(index))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
