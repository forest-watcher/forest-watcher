// @flow

import React from 'react';
import {
  View,
  Text,
  TouchableHighlight,
  Image,
  ScrollView
} from 'react-native';
import i18n from 'locales';
import Theme from 'config/theme';
import Row from 'components/common/row';
import styles from './styles';

const closeIcon = require('assets/close.png');

const getLayerName = name => ((name.match(/^layers\./) !== null) ? i18n.t(name) : name);

type Props = {
  onPressClose: () => void,
  legend: ?{ title: string, showRecent: boolean, color: string },
  layers: Array<{ id: string, name: string }>,
  onLayerToggle: (id: string, value: boolean) => void, // eslint-disable-line
  activeLayer: string
};

const MapSidebar = (props: Props) => {
  const { onPressClose, legend, layers, activeLayer, onLayerToggle } = props;
  return (
    <View
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>{i18n.t('map.settings')}</Text>
        <TouchableHighlight
          activeOpacity={0.5}
          underlayColor="transparent"
          onPress={onPressClose}
        >
          <Image style={Theme.icon} source={closeIcon} />
        </TouchableHighlight>
      </View>
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {legend !== null &&
        <View style={styles.legendContainer}>
          <Text style={styles.contextualLayersTitle}>{i18n.t('map.alerts')}</Text>
          <Row>
            <View style={styles.alertContainer}>
              <View style={[styles.alertLegend, { backgroundColor: legend.color }]} />
              <Text style={styles.sidebarLabel}>{i18n.t(legend.title)}</Text>
            </View>
          </Row>
          {legend.showRecent &&
            <Row>
              <View style={styles.alertContainer}>
                <View style={[styles.alertLegend, styles.alertLegendRecent]} />
                <Text style={styles.sidebarLabel}>{i18n.t('map.recent')}</Text>
              </View>
            </Row>
          }
          <Row>
            <View style={styles.alertContainer}>
              <View style={styles.alertLegend} />
              <Text style={styles.sidebarLabel}>{i18n.t('map.reported')}</Text>
            </View>
          </Row>
        </View>
        }
        <View style={styles.contextualLayersContainer}>
          <Text style={styles.contextualLayersTitle}>{i18n.t('map.ctxLayers')}</Text>
          {
            layers.map((layer) => (
              <Row
                key={layer.id}
                value={layer.id === activeLayer}
                onValueChange={value => onLayerToggle(layer.id, value)}
              >
                <Text style={styles.sidebarLabel}>{getLayerName(layer.name)}</Text>
              </Row>
            ))
          }
        </View>
      </ScrollView>
    </View>
  );
};

export default MapSidebar;
