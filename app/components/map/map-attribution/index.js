import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import styles from './styles';

function MapAttribution() {
  return (
    <View
      style={[
        styles.attributionContainer,
        styles.footerZIndex
      ]}
    >
      <Text style={styles.attributionText}>© OpenStreetMap</Text>
    </View>
  );
}

MapAttribution.propTypes = {
  hasAlertsSelected: PropTypes.bool
};

export default MapAttribution;
