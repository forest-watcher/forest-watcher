import { connect } from 'react-redux';
import { updateArea, deleteArea } from 'redux-modules/areas';
import AreaDetail from 'components/settings/area-detail';

function mapStateToProps(state, props) {
  const area = state.areas.data.find((areaData) => (areaData.id === props.id));
  return {
    imageUrl: state.areas.images[props.id],
    area,
    isConnected: state.offline.online,
    disableDelete: props.disableDelete || false
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateArea: (area) => {
      dispatch(updateArea(area));
    },
    deleteArea: (id) => {
      dispatch(deleteArea(id));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaDetail);
