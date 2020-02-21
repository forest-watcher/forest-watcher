import React from 'react';
import PropTypes from 'prop-types';
import { View, TouchableHighlight, Image, Platform, TouchableNativeFeedback } from 'react-native';

import Theme from 'config/theme';
import CustomSwitch from 'components/common/switch';
import styles from './styles';

function Row(props) {
  const hasCustomSwitch = typeof props.value !== 'undefined';
  const onPress = props.action ? props.action.callback : null;

  const Touchable = Platform.select({
    android: TouchableNativeFeedback,
    ios: TouchableHighlight
  });

  return (
    <Touchable
      activeOpacity={onPress ? props.opacity || 0.5 : 1}
      background={Platform.select({
        android: TouchableNativeFeedback.Ripple(Theme.background.gray),
        ios: undefined
      })}
      underlayColor="transparent"
      onPress={onPress}
    >
      <View style={[styles.row, props.rowStyle]}>
        <View style={props.style}>{props.children}</View>
        {hasCustomSwitch && (
          <CustomSwitch
            value={props.value}
            colorOn={props.switchColorOn}
            colorOff={props.switchColorOff}
            onValueChange={props.onValueChange}
          />
        )}
        {props.action && <Image style={[Theme.icon, props.action.position === 'top' ? styles.topIcon : {}]} source={props.action.icon} />}
      </View>
    </Touchable>
  );
}

Row.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  onValueChange: PropTypes.func,
  action: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    icon: PropTypes.any,
    position: PropTypes.oneOf(['top', 'center'])
  }),
  opacity: PropTypes.number,
  rowStyle: PropTypes.any,
  switchColorOn: PropTypes.string,
  switchColorOff: PropTypes.string
};

export default Row;
