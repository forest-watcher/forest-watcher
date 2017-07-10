import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import Theme from 'config/theme';
import Row from 'components/common/row';
import styles from './styles';

const closeIcon = require('assets/close.png');

const MapSidebar = (props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.heading}>Map settings</Text>
      <TouchableHighlight
        activeOpacity={0.5}
        underlayColor="transparent"
        onPress={props.onPressClose}
      >
        <Image style={Theme.icon} source={closeIcon} />
      </TouchableHighlight>
    </View>
    <View style={styles.body}>
      <View style={styles.contextualLayersContainer}>
        <Text style={styles.contextualLayersTitle}>Contextual layers</Text>
        {
          props.layers.map((layer) => (
            <Row
              key={layer.id}
              value={layer.id === props.activeLayer}
              onValueChange={value => props.onLayerToggle(layer.id, value)}
            >
              <Text>{layer.name}</Text>
            </Row>
          ))
        }
      </View>
    </View>
  </View>
);

MapSidebar.propTypes = {
  onPressClose: PropTypes.func.isRequired,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ),
  onLayerToggle: PropTypes.func.isRequired,
  activeLayer: PropTypes.string
};

export default MapSidebar;
