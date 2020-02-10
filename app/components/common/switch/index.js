import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-native';

import Theme from 'config/theme';

function CustomSwitch(props) {
  return (
    <Switch
      value={props.value}
      onValueChange={props.onValueChange}
      trackColor={Theme.colors.veryLightPink}
      thumbColor={props.value ? props.colorOn : props.colorOff}
    />
  );
}

CustomSwitch.defaultProps = {
  colorOff: Theme.colors.veryLightPink,
  colorOn: Theme.colors.turtleGreen
};

CustomSwitch.propTypes = {
  value: PropTypes.bool,
  onValueChange: PropTypes.func.isRequired,
  colorOn: PropTypes.string,
  colorOff: PropTypes.string
};

export default CustomSwitch;
