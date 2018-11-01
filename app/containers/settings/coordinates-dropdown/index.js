import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCoordinatesFormat } from 'redux-modules/app';
import { COORDINATES_FORMATS } from 'config/constants';
import i18n from 'locales';

import Dropdown from 'components/common/dropdown';

function mapStateToProps(state) {
  return {
    label: i18n.t('settings.coordinatesFormat'),
    selectedValue: state.app.coordinatesFormat,
    options: Object.values(COORDINATES_FORMATS)
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
