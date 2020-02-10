import React from 'react';
import { Platform } from 'react-native';
import PropTypes from 'prop-types';
import { Switch } from 'react-native';

import Theme from 'config/theme';

function CustomSwitch(props) {
  return (
    <Switch
      ios_backgroundColor={Theme.colors.veryLightPink}
      value={props.value}
      onValueChange={props.onValueChange}
      trackColor={Theme.colors.veryLightPink}
      thumbColor={Platform.OS === 'android' ? (props.value ? props.colorOn : props.colorOff) : null}
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
