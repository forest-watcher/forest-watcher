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
      onTintColor={Theme.colors.color6}
      thumbTintColor={Theme.colors.color1}
    />
  );
}

CustomSwitch.propTypes = {
  value: PropTypes.bool,
  onValueChange: PropTypes.func.isRequired
};

export default CustomSwitch;
