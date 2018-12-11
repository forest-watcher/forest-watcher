import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, Image, Platform, TouchableHighlight, TouchableNativeFeedback } from 'react-native';

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
    props.left ? styles.left : '',
    props.light ? styles.light : '',
    props.disabled ? styles.disabled : '',
    props.error ? styles.error : '',
    props.delete ? styles.error : '',
    props.style
  ];

  const btnStyles = [
    styles.button,
    props.light ? styles.buttonLight : '',
    props.short ? styles.short : '',
    props.disabled || props.delete || props.noIcon ? styles.buttonNoIcon : ''
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

  const arrowIconStyles = [Theme.icon, props.short ? styles.shortIcon : ''];

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

  const Touchable = Platform.select({
    android: TouchableNativeFeedback,
    ios: TouchableHighlight
  });

  return (
    <Touchable
      style={Platform.select({
        android: { borderRadius: 32 },
        ios: containerStyles
      })}
      onPress={onButtonPress}
      background={Platform.select({
        android: TouchableNativeFeedback.Ripple(props.light ? Theme.background.secondary : Theme.background.white),
        ios: undefined
      })}
      activeOpacity={0.8}
      underlayColor={underlayColor}
      disabled={props.disabled}
    >
      <View
        style={Platform.select({
          android: [containerStyles, btnStyles],
          ios: btnStyles
        })}
      >
        {icons[props.icon] && (
          <View style={styles.iconContainer}>
            <Image style={Theme.icon} source={icons[props.icon]} />
          </View>
        )}
        {props.text && <Text style={textStyles}>{props.text.toUpperCase()}</Text>}
        {!(props.disabled || props.delete || props.noIcon) && (
          <View style={styles.iconContainer}>
            <Image style={arrowIconStyles} source={arrowIcon} />
          </View>
        )}
      </View>
    </Touchable>
  );
}

ActionButton.defaultProps = {
  disabled: false,
  short: false
};

ActionButton.propTypes = {
  light: PropTypes.bool,
  style: PropTypes.any,
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
