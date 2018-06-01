import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const nextIcon = require('assets/next.png');
const nextIconWhite = require('assets/next_white.png');

// Feature ready to use icons but empty to remove old and unused ones
const icons = {};

function ActionButton(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress();
    }
  }
  const containerStyles = [
    styles.container,
    props.monochrome ? styles.light : '',
    props.light ? styles.light : '',
    props.disabled ? styles.disabled : '',
    props.error ? styles.error : '',
    props.delete ? styles.error : '',
    props.style
  ];

  const btnStyles = [
    styles.button,
    props.light ? styles.buttonLight : '',
    props.short ? styles.short : ''
  ];

  const textStyles = [
    styles.buttonText,
    props.main ? styles.buttonTextMain : '',
    props.monochrome ? styles.buttonTextMonochrome : '',
    props.light ? styles.buttonTextLight : '',
    props.left ? styles.buttonTextLeft : '',
    props.disabled ? styles.buttonTextDisabled : '',
    props.error ? styles.buttonTextError : '',
    props.delete ? styles.buttonTextError : ''
  ];

  const arrowIconStyles = [
    Theme.icon,
    props.short ? styles.shortIcon : ''
  ];

  let arrowIcon = nextIconWhite;
  let underlayColor = Theme.background.secondary;
  if (props.light) {
    underlayColor = Theme.background.white;
    arrowIcon = nextIcon;
  }
  if (props.monochrome) {
    arrowIcon = nextIcon;
  }
  if (props.disabled) underlayColor = Theme.colors.color6;
  if (props.error || props.delete) underlayColor = Theme.colors.color7;

  return (
    <TouchableHighlight
      style={containerStyles}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={underlayColor}
    >
      <View style={btnStyles}>
        <View style={styles.iconContainer}>
          {icons[props.icon] &&
            <Image style={Theme.icon} source={icons[props.icon]} />
          }
        </View>
        <Text style={textStyles}>{props.text.toUpperCase()}</Text>
        <View style={styles.iconContainer}>
          {!(props.disabled || props.delete || props.noIcon) &&
            <Image style={arrowIconStyles} source={arrowIcon} />
          }
        </View>
      </View>
    </TouchableHighlight>
  );
}

ActionButton.defaultProps = {
  disabled: false,
  short: false
};

ActionButton.propTypes = {
  light: PropTypes.bool,
  style: PropTypes.node,
  left: PropTypes.bool,
  disabled: PropTypes.bool,
  delete: PropTypes.bool,
  short: PropTypes.bool,
  error: PropTypes.bool,
  icon: PropTypes.string,
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  noIcon: PropTypes.bool,
  main: PropTypes.bool,
  monochrome: PropTypes.bool
};

export default ActionButton;
