// @flow

import React from 'react';
import I18n from 'locales';
import {
  View,
  Text
} from 'react-native';

import GeoPoint from 'geopoint';
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
  const { alertSelected, lastPosition, coordinatesFormat, kmThreshold } = props;

  let distanceText = '';
  let positionText = '';
  let distance = 99999999;
  if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
    const { latitude, longitude } = lastPosition;
    const geoPoint = new GeoPoint(alertSelected.latitude, alertSelected.longitude);
    const currentPoint = new GeoPoint(latitude, longitude);
    const text = formatCoordsByFormat(lastPosition, coordinatesFormat);
    if (text) {
      positionText += text;
    }
    const meters = (currentPoint.distanceTo(geoPoint, true) * 1000); // in meters
    distance = meters.toFixed(0);
    distanceText = `${distance} ${I18n.t('commonText.metersAway')}`;

    if (kmThreshold && meters >= (kmThreshold * 1000)) {
      distance = (meters / 1000).toFixed(1); // in Kilometers
      distanceText = `${distance} ${I18n.t('commonText.kmAway')}`;
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
