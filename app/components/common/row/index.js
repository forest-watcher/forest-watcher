import React from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';
import CustomSwitch from 'components/common/switch';
import styles from './styles';

function Row(props) {
  const hasCustomSwitch = typeof props.value !== 'undefined';
  return (
    <View style={styles.row}>
      <View style={styles.title}>
        {props.children}
      </View>
      {hasCustomSwitch && <CustomSwitch value={props.value} onValueChange={props.onValueChange} />}
    </View>
  );
}

Row.propTypes = {
  children: PropTypes.node,
  value: PropTypes.bool,
  onValueChange: PropTypes.func
};

export default Row;
