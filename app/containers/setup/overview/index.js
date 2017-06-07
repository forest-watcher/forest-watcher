import { connect } from 'react-redux';
import SetupOverview from 'components/setup/overview';
import { saveArea } from 'redux-modules/areas';

function mapStateToProps(state) {
  return {
    area: state.setup.area,
    snapshot: state.setup.snapshot,
    user: {
      id: state.user.data.id,
      token: state.user.token
    },
    areaSaved: state.setup.areaSaved,
    areaId: state.setup.area.id
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
