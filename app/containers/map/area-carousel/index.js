import { connect } from 'react-redux';
import AreaCarousel from 'components/map/area-carousel';
import { updateSelectedIndex } from 'redux-modules/areas';

function mapStateToProps(state) {
  const areas = state.areas.data.map((area) => (
    {
      id: area.id,
      name: area.attributes.name,
      geostoreId: area.attributes.geostore,
      datasets: area.datasets
    }
    ));
  return {
    areas
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    updateSelectedArea: (index) => {
      dispatch(updateSelectedIndex(index));
    },
    navigate: (routeName, params) => {
      navigation.navigate(routeName, params);
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AreaCarousel);
