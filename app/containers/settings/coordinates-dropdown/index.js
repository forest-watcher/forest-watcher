// @flow
import type { ComponentProps, Dispatch, State } from 'types/store.types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setCoordinatesFormat } from 'redux-modules/app';
import { COORDINATES_FORMATS } from 'config/constants';
import i18n from 'i18next';

import Dropdown from 'components/common/dropdown';

type OwnProps = {||};

function mapStateToProps(state: State) {
  return {
    description: i18n.t('settings.coordinatesDescription'),
    hideLabel: true,
    label: i18n.t('settings.coordinatesFormat'),
    selectedValue: state.app.coordinatesFormat,
    options: Object.values(COORDINATES_FORMATS)
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      onValueChange: setCoordinatesFormat
    },
    dispatch
  );
}

type PassedProps = ComponentProps<OwnProps, typeof mapStateToProps, typeof mapDispatchToProps>;
export default connect<PassedProps, OwnProps, _, _, State, Dispatch>(
  mapStateToProps,
  mapDispatchToProps
)(Dropdown);
