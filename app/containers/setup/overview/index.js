import { connect } from 'react-redux';
import SetupOverview from 'components/setup/overview';
import { saveArea } from 'redux-modules/areas';

function mapStateToProps(state) {
  return {
    area: state.setup.area,
    snapshot: state.setup.snapshot,
    areaSaved: state.setup.areaSaved
  };
}

function mapDispatchToProps(dispatch) {
  return {
    saveArea: (action) => {
      dispatch(saveArea(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SetupOverview);
