import { connect } from 'react-redux';

import AreaList from 'components/settings/area-list';

function mapStateToProps(state) {
  const { images, data } = state.areas;
  const areas = data.map((area) => {
    const parsedArea = area;
    if (images[area.id]) {
      parsedArea.image = images[area.id];
    }
    return parsedArea;
  });
  return {
    areas
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
