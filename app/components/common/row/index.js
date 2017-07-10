import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import CustomSwitch from 'components/common/switch';
import styles from './styles';

function Row(props) {
  const hasCustomSwitch = typeof props.value !== 'undefined';
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{props.text}</Text>
      {hasCustomSwitch && <CustomSwitch value={props.value} onValueChange={props.onValueChange} />}
    </View>
  );
}

Row.propTypes = {
  text: PropTypes.string.isRequired,
  value: PropTypes.bool,
  onValueChange: PropTypes.func
};

export default Row;
