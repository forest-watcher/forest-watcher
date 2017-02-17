import { connect } from 'react-redux';
import { getAreas } from 'redux-modules/areas';
import Alerts from 'components/alerts';

function mapStateToProps(state) {
  return {
    areas: state.areas.data,
    areasImages: state.areas.images
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    },
    fetchData: (action) => {
      dispatch(getAreas(action));
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Alerts);
