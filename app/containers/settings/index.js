import { connect } from 'react-redux';
import { getAreas } from 'redux-modules/areas';

import Settings from 'components/settings';

function mapStateToProps(state) {
  return {
    user: state.user.data,
    areas: state.areas.data,
    areasImages: state.areas.images
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getAreas: () => {
      dispatch(getAreas());
    }
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Settings);
