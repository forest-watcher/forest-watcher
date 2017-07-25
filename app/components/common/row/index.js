import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  TouchableHighlight,
  Image
} from 'react-native';

import Theme from 'config/theme';
import CustomSwitch from 'components/common/switch';
import styles from './styles';

function Row(props) {
  const hasCustomSwitch = typeof props.value !== 'undefined';
  const onPress = props.action ? props.action.callback : null;
  return (
    <TouchableHighlight
      activeOpacity={onPress ? 0.5 : 1}
      underlayColor="transparent"
      onPress={onPress}
      style={props.style}
    >
      <View style={styles.row}>
        <View style={styles.title}>
          {props.children}
        </View>
        {hasCustomSwitch && <CustomSwitch value={props.value} onValueChange={props.onValueChange} />}
        {props.action &&
          <Image style={Theme.icon} source={props.action.icon} />
        }
      </View>
    </TouchableHighlight>
  );
}

Row.propTypes = {
  style: PropTypes.node,
  children: PropTypes.node,
  value: PropTypes.bool,
  onValueChange: PropTypes.func,
  action: PropTypes.shape({
    callback: PropTypes.func.isRequired,
    icon: PropTypes.any
  })
};

export default Row;
