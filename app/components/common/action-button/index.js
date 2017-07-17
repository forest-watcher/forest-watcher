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
const reportSingle = require('assets/report_single.png'); // eslint-disable-line
const reportArea = require('assets/report_area.png');

const icons = { reportSingle, reportArea }; // eslint-disable-line

function ActionButton(props) {
  function onButtonPress() {
    if (!props.disabled) {
      props.onPress();
    }
  }
  const btnStyles = [
    styles.container,
    props.monochrome ? styles.light : '',
    props.light ? styles.light : '',
    props.disabled ? styles.disabled : '',
    props.error ? styles.error : '',
    props.delete ? styles.error : '',
    props.style
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
      style={btnStyles}
      onPress={onButtonPress}
      activeOpacity={0.8}
      underlayColor={underlayColor}
    >
      <View style={[styles.button, props.light ? styles.buttonLight : '']}>
        <View style={styles.iconContainer}>
          {icons[props.icon] &&
            <Image style={Theme.icon} source={icons[props.icon]} />
          }
        </View>
        <Text style={textStyles}>{props.text}</Text>
        <View style={styles.iconContainer}>
          {!(props.disabled || props.delete || props.noIcon) &&
            <Image style={Theme.icon} source={arrowIcon} />
          }
        </View>
      </View>
    </TouchableHighlight>
  );
}

ActionButton.defaultProps = {
  disabled: false
};

ActionButton.propTypes = {
  light: PropTypes.bool,
  style: PropTypes.node,
  left: PropTypes.bool,
  disabled: PropTypes.bool,
  delete: PropTypes.bool,
  error: PropTypes.bool,
  icon: PropTypes.string,
  text: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  noIcon: PropTypes.bool,
  main: PropTypes.bool,
  monochrome: PropTypes.bool
};

export default ActionButton;
