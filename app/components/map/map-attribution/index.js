// @flow

import React, { Component } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import styles from './styles';

const mapboxImage = require('assets/mapbox.png');

type ViewProps = React.ElementProps<typeof View>;
type ViewStyleProp = $PropertyType<ViewProps, 'style'>;

type Props = {
  style?: ?ViewStyleProp
};

export default class MapAttribution extends Component<Props> {

	render() {
    return (
      <View style={[styles.attributionContainer, styles.footerZIndex, this.props.style]} pointerEvents="box-none">
        <Image source={mapboxImage} />
        <Text style={styles.attributionText}>{' © Mapbox © OpenStreetMap'}</Text>
      </View>
    );
	}
}
