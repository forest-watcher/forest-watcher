import { connect } from 'react-redux';
import { updateArea, getDatasets } from 'redux-modules/areas';
import AlertSystem from 'components/settings/area-detail/alert-system';

function mapStateToProps(state, { areaId }) {
  const area = state.areas.data.find((areaData) => (areaData.id === areaId));
  return {
    area
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getDatasets: (areaId) => {
      dispatch(getDatasets(areaId));
    },
    updateArea: (area) => {
      dispatch(updateArea(area));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertSystem);
