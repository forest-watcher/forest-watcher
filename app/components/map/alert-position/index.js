// @flow

import React from 'react';
import i18n from 'locales';
import {
  View,
  Text
} from 'react-native';

import geokdbush from 'geokdbush';
import { formatCoordsByFormat } from 'helpers/map';
import type { Coordinates, CoordinatesFormat } from 'types/common.types';

import styles from './styles';

type Props = {
  alertSelected: Coordinates,
  lastPosition: Coordinates,
  coordinatesFormat: CoordinatesFormat,
  kmThreshold: number
};

function AlertPosition(props: Props) {
  const {
    alertSelected,
    lastPosition,
    coordinatesFormat,
    kmThreshold
  } = props;

  let distanceText = '';
  let positionText = '';
  let distance = 99999999;

  if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
    const { latitude, longitude } = lastPosition;
    const text = formatCoordsByFormat(lastPosition, coordinatesFormat);
    if (text) {
      positionText += text;
    }
    const meters = geokdbush.distance(alertSelected.longitude, alertSelected.latitude, longitude, latitude) * 1000; // in meters
    distance = meters.toFixed(0);
    distanceText = `${distance} ${i18n.t('commonText.metersAway')}`;

    if (kmThreshold && meters >= (kmThreshold * 1000)) {
      distance = (meters / 1000).toFixed(1); // in Kilometers
      distanceText = `${distance} ${i18n.t('commonText.kmAway')}`;
    }
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View pointerEvents="none" style={[styles.currentPositionContainer, styles.footerZIndex]}>
        <Text style={styles.coordinateDistanceText}>
          {positionText}
        </Text>
        <Text style={styles.coordinateDistanceText}>
          {distanceText}
        </Text>
      </View>
    </View>
  );
}

export default AlertPosition;
