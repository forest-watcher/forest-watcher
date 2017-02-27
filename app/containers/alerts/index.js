import { connect } from 'react-redux';
import { getAreas } from 'redux-modules/areas';

import Alerts from 'components/alerts';

function mapStateToProps(state) {
  return {
    areas: state.areas.data
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName, params) => {
      navigation.navigate(routeName, {
        title: params.title,
        features: params.features,
        center: params.center,
        geojson: params.geojson
      });
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
