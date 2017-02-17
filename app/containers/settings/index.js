import { connect } from 'react-redux';
import { getAreas } from 'redux-modules/areas';

import Settings from 'components/settings';

function mapStateToProps(state, ownprops) {
  return {
    user: state.user.data,
    areas: state.areas.data,
    areasImages: state.areas.images
  };
}

function mapDispatchToProps(dispatch, { navigation }) {
  return {
    navigate: (routeName) => {
      navigation.navigate(routeName);
    },
    getAreas: () => {
      dispatch(getAreas());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
