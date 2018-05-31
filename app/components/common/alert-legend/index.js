// @flow
import React from 'react';
import {
  View,
  Text
} from 'react-native';

import styles from './styles';

type Props = {
  color: string,
  label: string,
  style: Object
};

function Alertlegend(props: Props) {
  const { style, color, label } = props;
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.alertIcon, { backgroundColor: color }]} />
      <Text style={styles.alertLabel}>{label}</Text>
    </View>
  );
}

export default Alertlegend;
