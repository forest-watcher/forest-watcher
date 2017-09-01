import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';
import i18n from 'locales';
import Theme from 'config/theme';
import Row from 'components/common/row';
import styles from './styles';

const closeIcon = require('assets/close.png');

const MapSidebar = (props) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.heading}>{i18n.t('map.settings')}</Text>
      <TouchableHighlight
        activeOpacity={0.5}
        underlayColor="transparent"
        onPress={props.onPressClose}
      >
        <Image style={Theme.icon} source={closeIcon} />
      </TouchableHighlight>
    </View>
    <View style={styles.body}>
      {props.legend && props.showLegend &&
        <View style={styles.legendContainer}>
          <Text style={styles.contextualLayersTitle}>{i18n.t('map.alerts')}</Text>
          <Row>
            <View style={styles.alertContainer}>
              <View style={[styles.alertLegend, { backgroundColor: props.legend.color }]} />
              <Text>{props.legend.title}</Text>
            </View>
          </Row>
          <Row>
            <View style={styles.alertContainer}>
              <View style={styles.alertLegend} />
              <Text>{i18n.t('map.reported').toUpperCase()}</Text>
            </View>
          </Row>
        </View>
      }
      <View style={styles.contextualLayersContainer}>
        <Text style={styles.contextualLayersTitle}>{i18n.t('map.ctxLayers')}</Text>
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
  legend: PropTypes.oneOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    }),
    PropTypes.bool,
  ),
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  onLayerToggle: PropTypes.func.isRequired, // eslint-disable-line
  activeLayer: PropTypes.string,
  showLegend: PropTypes.bool
};

export default MapSidebar;
