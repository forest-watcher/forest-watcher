import React from 'react';
import { View, Text, Image } from 'react-native';
import styles from './styles';

const mapboxImage = require('assets/mapbox.png');

function MapAttribution() {
  return (
    <View style={[styles.attributionContainer, styles.footerZIndex]} pointerEvents="box-none">
      <Image source={mapboxImage} />
      <Text style={styles.attributionText}>{` © OpenStreetMap`}</Text>
    </View>
  );
}

export default MapAttribution;
