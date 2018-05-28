import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';

import styles from './styles';

function Alertlegend(props) {
  const { style, color, label } = props;
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.alertIcon, { backgroundColor: color }]} />
      <Text style={styles.alertLabel}>{label}</Text>
    </View>
  );
}

Alertlegend.propTypes = {
  color: PropTypes.string,
  label: PropTypes.string
};

export default Alertlegend;
