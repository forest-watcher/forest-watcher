import React from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableHighlight } from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

function ButtonCircle(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress?.();
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
    underlayColor = Theme.colors.carnation;
  }
  if (props.gray) {
    underlayColor = Theme.background.gray;
  }
  if (props.disabled) {
    underlayColor = Theme.colors.veryLightPinkTwo;
  }

  return (
    <TouchableHighlight onLayout={props.onLayout} style={[btnStyles, props.style]} onPress={onButtonPress} activeOpacity={0.8} underlayColor={underlayColor}>
      {props.icon && <Image style={props.shouldFillContainer ? Theme.largeIcon : Theme.icon} source={props.icon} />}
    </TouchableHighlight>
  );
}

ButtonCircle.defaultProps = {
  disabled: false,
  shouldFillContainer: false
};

ButtonCircle.propTypes = {
  shouldFillContainer: PropTypes.bool,
  red: PropTypes.bool,
  light: PropTypes.bool,
  style: PropTypes.node,
  icon: PropTypes.number,
  disabled: PropTypes.bool,
  onLayout: PropTypes.func,
  onPress: PropTypes.func.isRequired,
  gray: PropTypes.bool
};

export default ButtonCircle;
