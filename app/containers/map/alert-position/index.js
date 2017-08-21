import { connect } from 'react-redux';
import AlertPosition from 'components/map/alert-position';

function mapStateToProps(state) {
  return {
    coordinatesFormat: state.app.coordinatesFormat
  };
}

export default connect(
  mapStateToProps
)(AlertPosition);
