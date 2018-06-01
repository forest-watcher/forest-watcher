import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

function ButtonCircle(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress();
    }
  }
  const btnStyles = [
    styles.container,
    props.light ? styles.light : '',
    props.gray ? styles.gray : '',
    props.red ? styles.red : '',
    props.style
  ];

  let underlayColor = Theme.background.secondary;
  if (props.light) {
    underlayColor = Theme.background.white;
  }
  if (props.red) {
    underlayColor = Theme.colors.color7;
  }
  if (props.gray) {
    underlayColor = Theme.background.gray;
  }
  if (props.disabled) underlayColor = Theme.colors.color6;

  return (
    <TouchableHighlight
      style={btnStyles}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={underlayColor}
    >
      {props.icon &&
        // https://github.com/facebook/react-native/issues/14958#issuecomment-324237317
        <View pointerEvents="none">
          <Image style={Theme.icon} source={props.icon} />
        </View>
      }
    </TouchableHighlight>
  );
}

ButtonCircle.defaultProps = {
  disabled: false
};

ButtonCircle.propTypes = {
  red: PropTypes.bool,
  light: PropTypes.bool,
  style: PropTypes.node,
  icon: PropTypes.number,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired
};

export default ButtonCircle;
