import { connect } from 'react-redux';
import { updateArea, getDatasets, cacheArea, removeCachedArea, setAreaDatasetStatus } from 'redux-modules/areas';
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
    },
    cacheArea: (areaId, dataset) => {
      dispatch(cacheArea(areaId, dataset));
    },
    removeCachedArea: (areaId, dataset) => {
      dispatch(removeCachedArea(areaId, dataset));
    },
    setAreaDatasetStatus: (areaId, dataset, status) => {
      dispatch(setAreaDatasetStatus(areaId, dataset, status));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertSystem);
