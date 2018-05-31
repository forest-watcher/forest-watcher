// @flow

import React from 'react';
import {
  View,
  Text,
  ScrollView
} from 'react-native';
import i18n from 'locales';
import Row from 'components/common/row';
import AlertSystem from 'containers/settings/area-detail/alert-system';
import styles from './styles';

const getLayerName = name => ((name.match(/^layers\./) !== null) ? i18n.t(name) : name);

type Props = {
  areaId: string,
  layers: Array<{ id: string, name: string }>,
  onLayerToggle: (id: string, value: boolean) => void, // eslint-disable-line
  activeLayer: string
};

const MapSidebar = (props: Props) => {
  const { layers, activeLayer, onLayerToggle, areaId } = props;
  return (
    <View
      style={styles.container}
    >
      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {areaId &&
          <View style={styles.legendContainer}>
            <Text style={styles.contextualLayersTitle}>{i18n.t('map.alerts')}</Text>
            <AlertSystem areaId={areaId} showLegend />
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
