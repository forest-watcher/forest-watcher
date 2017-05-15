import React from 'react';
import {
  Switch
} from 'react-native';

import Theme from 'config/theme';

function CustomSwitch(props) {
  return (
    <Switch
      value={props.value}
      onValueChange={props.onValueChange}
      thumbTintColor={Theme.colors.color1}
    />
  );
}

CustomSwitch.propTypes = {
  value: React.PropTypes.bool,
  onValueChange: React.PropTypes.func.isRequired
};

export default CustomSwitch;
