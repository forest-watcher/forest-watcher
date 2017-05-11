import { connect } from 'react-redux';
import { deleteArea } from 'redux-modules/areas';
import { isConnected } from 'redux-modules/app';
import AreaDetail from 'components/settings/area-detail';

function mapStateToProps(state, props) {
  const area = state.areas.data.find((areaData) => (areaData.id === props.id));
  return {
    imageUrl: state.areas.images[props.id],
    area
  };
}

function mapDispatchToProps(dispatch) {
  return {
    deleteArea: (id) => {
      dispatch(deleteArea(id));
    },
    isConnected: () => {
      dispatch(isConnected());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaDetail);
