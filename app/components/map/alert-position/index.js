import React from 'react';
import PropTypes from 'prop-types';
import I18n from 'locales';
import {
  View,
  Text
} from 'react-native';

import GeoPoint from 'geopoint';
import formatcoords from 'formatcoords';
import { COORDINATES_FORMATS } from 'config/constants';

import styles from './styles';


function AlertPosition(props) {
  const { alertSelected, lastPosition, coordinatesFormat, kmThreshold } = props;

  let distanceText = '';
  let positionText = '';
  let distance = 99999999;
  if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
    const geoPoint = new GeoPoint(alertSelected.latitude, alertSelected.longitude);
    const currentPoint = new GeoPoint(lastPosition.latitude, lastPosition.longitude);
    if (coordinatesFormat === COORDINATES_FORMATS.decimal.value) {
      positionText = `${I18n.t('commonText.yourPosition')}: ${lastPosition.latitude.toFixed(4)}, ${lastPosition.longitude.toFixed(4)}`;
    } else {
      const degrees = formatcoords(lastPosition.latitude, lastPosition.longitude)
        .format('FFf', { latLonSeparator: ', ', decimalPlaces: 2 });
      positionText = `${I18n.t('commonText.yourPosition')}: ${degrees}`;
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

AlertPosition.propTypes = {
  alertSelected: PropTypes.object,
  lastPosition: PropTypes.object,
  coordinatesFormat: PropTypes.string
};

export default AlertPosition;
