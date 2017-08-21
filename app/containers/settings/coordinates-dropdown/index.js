import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCoordinatesFormat } from 'redux-modules/app';
import { COORDINATES_FORMATS } from 'config/constants';

import Dropdown from 'components/common/dropdown';

function mapStateToProps(state) {
  return {
    label: 'settings.coordinatesFormat',
    selectedValue: state.app.coordinatesFormat,
    options: Object.values(COORDINATES_FORMATS).map(format => ({ key: format.value, ...format }))
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({
    onValueChange: setCoordinatesFormat
  }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dropdown);
