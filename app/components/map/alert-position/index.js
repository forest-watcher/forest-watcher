// @flow

import React from 'react';
import { View, Text } from 'react-native';

import { formatCoordsByFormat, getDistanceFormattedText } from 'helpers/map';
import type { Coordinates, CoordinatesFormat } from 'types/common.types';

import styles from './styles';

type Props = {
  alertSelected: Coordinates,
  lastPosition: Coordinates,
  coordinatesFormat: CoordinatesFormat,
  kmThreshold: number
};

function AlertPosition(props: Props) {
  const { alertSelected, lastPosition, coordinatesFormat, kmThreshold } = props;

  let distanceText = '';
  let positionText = '';

  if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
    const { latitude, longitude } = lastPosition;
    const text = formatCoordsByFormat(lastPosition, coordinatesFormat);
    if (text) {
      positionText += text;
    }

    distanceText = getDistanceFormattedText(alertSelected, { longitude: longitude, latitude: latitude }, kmThreshold);
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View pointerEvents="none" style={[styles.currentPositionContainer, styles.footerZIndex]}>
        <Text style={styles.coordinateDistanceText}>{positionText}</Text>
        <Text style={styles.coordinateDistanceText}>{distanceText}</Text>
      </View>
    </View>
  );
}

export default AlertPosition;
