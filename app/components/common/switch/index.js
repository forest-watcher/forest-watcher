import React from 'react';
import PropTypes from 'prop-types';
import {
  Switch
} from 'react-native';

import Theme from 'config/theme';

function CustomSwitch(props) {
  return (
    <Switch
      value={props.value}
      onValueChange={props.onValueChange}
      tintColor={Theme.colors.color6}
      onTintColor={Theme.colors.color4}
      thumbTintColor={props.value ? props.colorOn : props.colorOff}
    />
  );
}

CustomSwitch.defaultProps = {
  colorOn: Theme.colors.color1,
  colorOff: Theme.colors.color4
};

CustomSwitch.propTypes = {
  value: PropTypes.bool,
  onValueChange: PropTypes.func.isRequired,
  colorOn: PropTypes.string,
  colorOff: PropTypes.string
};

export default CustomSwitch;
