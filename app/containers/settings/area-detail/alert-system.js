import { connect } from 'react-redux';
import { getAreaCoverage, setAreaDatasetStatus, updateDate } from 'redux-modules/areas';
import AlertSystem from 'components/settings/area-detail/alert-system';

function mapStateToProps(state, { areaId }) {
  const area = state.areas.data.find((areaData) => (areaData.id === areaId));
  return {
    area
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getAreaCoverage: (areaId) => {
      dispatch(getAreaCoverage(areaId));
    },
    setAreaDatasetStatus: (areaId, dataset, status) => {
      dispatch(setAreaDatasetStatus(areaId, dataset, status));
    },
    updateDate: (areaId, dataset, date) => dispatch(updateDate(areaId, dataset, date))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertSystem);
