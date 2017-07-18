import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image
} from 'react-native';
import Theme from 'config/theme';
import styles from './styles';

const mapboxImage = require('assets/mapbox.png');


function MapAttribution({ hasAlertsSelected }) {
  const fullWidth = Theme.screen.width;
  return (
    <View
      style={[
        styles.attributionContainer,
        styles.footerZIndex,
        { width: hasAlertsSelected ? fullWidth / 2 : fullWidth }
      ]}
    >
      <Image source={mapboxImage} />
      <Text style={styles.attributionText}>© Mapbox</Text>
      <Text style={styles.attributionText}>© OpenStreetMap</Text>
    </View>
  );
}

MapAttribution.propTypes = {
  hasAlertsSelected: PropTypes.bool.isRequired
};

export default MapAttribution;
