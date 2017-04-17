import { connect } from 'react-redux';

import AreaList from 'components/settings/area-list';

function mapStateToProps(state) {
  return {
    areas: state.areas.data,
    areasImages: state.areas.images,
    syncing: state.areas.syncing
  };
}


function mapDispatchToProps({ navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaList);
