import { connect } from 'react-redux';

import AreaDetail from 'components/settings/area-detail';
import { removeArea } from 'redux-modules/areas';

function mapStateToProps(state, { navigation }) {
  const area = state.areas.data.find((areaData) => (areaData.id === navigation.state.params.id));
  return {
    imageUrl: state.areas.images[navigation.state.params.id],
    area
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    },
    onRemovePress: (id) => dispatch(removeArea(id))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaDetail);
