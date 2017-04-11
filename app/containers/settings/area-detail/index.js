import { connect } from 'react-redux';
import { deleteArea } from 'redux-modules/areas';
import { isConnected } from 'redux-modules/app';
import AreaDetail from 'components/settings/area-detail';

function mapStateToProps(state, { navigation }) {
  const area = state.areas.data.find((areaData) => (areaData.id === navigation.state.params.id));
  return {
    imageUrl: state.areas.images[navigation.state.params.id],
    area
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    },
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
