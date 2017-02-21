import React from 'react';
import {
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';

const backIconWhite = require('assets/previous_white.png');
const backIcon = require('assets/previous.png');

function LeftHeaderBtn(props) {
  return (
    <TouchableHighlight
      onPress={() => props.goBack()}
      underlayColor="transparent"
      activeOpacity={0.8}
    >
      <Image style={Theme.icon} source={props.light ? backIconWhite : backIcon} />
    </TouchableHighlight>
  );
}

LeftHeaderBtn.propTypes = {
  light: React.PropTypes.bool,
  goBack: React.PropTypes.func.isRequired
};

export default LeftHeaderBtn;
