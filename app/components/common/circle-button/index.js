import React from 'react';
import PropTypes from 'prop-types';
import {
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
    props.style
  ];

  let underlayColor = Theme.background.secondary;
  if (props.light) {
    underlayColor = Theme.background.white;
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
        <Image style={Theme.icon} source={props.icon} />
      }
    </TouchableHighlight>
  );
}

ButtonCircle.defaultProps = {
  disabled: false
};

ButtonCircle.propTypes = {
  light: PropTypes.bool,
  style: PropTypes.node,
  icon: PropTypes.number,
  disabled: PropTypes.bool,
  onPress: PropTypes.func.isRequired
};

export default ButtonCircle;
