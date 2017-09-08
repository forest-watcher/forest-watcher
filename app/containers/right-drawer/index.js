import { connect } from 'react-redux';
import { setShowLegend } from 'redux-modules/layers';
import RightDrawer from 'components/right-drawer';

function mapDispatchToProps(dispatch) {
  return {
    setShowLegend: (showLegend) => {
      dispatch(setShowLegend(showLegend));
    }
  };
}

export default connect(
  null,
  mapDispatchToProps
)(RightDrawer);
