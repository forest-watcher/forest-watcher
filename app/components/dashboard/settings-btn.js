import React from 'react';
import {
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';

const settingsIcon = require('assets/settings.png');

function SettingsBtn(props) {
  return (
    <TouchableHighlight
      onPress={props.onPress}
      underlayColor="transparent"
      activeOpacity={0.8}
    >
      <Image style={Theme.icon} source={settingsIcon} />
    </TouchableHighlight>
  );
}

SettingsBtn.propTypes = {
  onPress: React.PropTypes.func.isRequired
};

export default SettingsBtn;
