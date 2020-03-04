import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCoordinatesFormat } from 'redux-modules/app';
import { COORDINATES_FORMATS } from 'config/constants';
import i18n from 'i18next';

import Dropdown from 'components/common/dropdown';

function mapStateToProps(state) {
  return {
    description: i18n.t('settings.coordinatesDescription'),
    label: i18n.t('settings.coordinatesFormat'),
    selectedValue: state.app.coordinatesFormat,
    options: Object.values(COORDINATES_FORMATS).map(coordinateFormat => {
      return {
        label: i18n.t(coordinateFormat.labelKey),
        value: coordinateFormat.value
      }
    })
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      onValueChange: setCoordinatesFormat
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dropdown);
