import React from 'react';
import PropTypes from 'prop-types';
import I18n from 'locales';
import {
  View,
  Text
} from 'react-native';

import GeoPoint from 'geopoint';
import styles from './styles';


function AlertPosition(props) {
  const { alertSelected, lastPosition } = props;

  let distanceText = '';
  let positionText = '';
  let distance = 99999999;
  if (lastPosition && (alertSelected && alertSelected.latitude && alertSelected.longitude)) {
    const geoPoint = new GeoPoint(alertSelected.latitude, alertSelected.longitude);
    const currentPoint = new GeoPoint(lastPosition.latitude, lastPosition.longitude);
    positionText = `${I18n.t('commonText.yourPosition')}: ${lastPosition.latitude.toFixed(4)}, ${lastPosition.longitude.toFixed(4)}`;
    distance = currentPoint.distanceTo(geoPoint, true).toFixed(4);
    distanceText = `${distance} ${I18n.t('commonText.kmAway')}`; // in Kilometers
  }

  return (
    <View style={styles.container}>
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
  lastPosition: PropTypes.object
};

export default AlertPosition;
