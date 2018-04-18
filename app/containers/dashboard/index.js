import { connect } from 'react-redux';
import Dashboard from 'components/dashboard';
import { setPristineCacheTooltip } from 'redux-modules/app';
import { createReport } from 'redux-modules/reports';
import { updateSelectedIndex } from 'redux-modules/areas';

function mapStateToProps(state) {
  return {
    pristine: state.app.pristineCacheTooltip
  };
}

function mapDispatchToProps(dispatch) {
  return {
    createReport: (report) => {
      dispatch(createReport(report));
    },
    setPristine: (pristine) => {
      dispatch(setPristineCacheTooltip(pristine));
    },
    updateSelectedIndex: index => dispatch(updateSelectedIndex(index))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
