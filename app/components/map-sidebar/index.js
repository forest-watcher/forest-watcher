// @flow

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import SettingsButton from 'components/common/settings-button';
import i18n from 'i18next';

type Props = {
  areaId: string,
  layers: Array<{ id: string, name: string }>,
  onLayerToggle: (id: string, value: boolean) => void, // eslint-disable-line
  activeLayer: string
};

const MapSidebar = (props: Props) => {
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <Text style={styles.heading}>Layers</Text>
        <VerticalSplitRow
          onPress={() => {}}
          title={i18n.t('map.layerSettings.Alerts')}
          settingsTitle={'omg'}
          hideDivider={true}
          selected={true}
          style={styles.rowContainer}
          hideImage
          smallerHorizontalPadding
        />
        <VerticalSplitRow
          onPress={() => {}}
          title={i18n.t('map.layerSettings.Routes')}
          settingsTitle={'All'}
          hideDivider={false}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
        <VerticalSplitRow
          onPress={() => {}}
          title={i18n.t('map.layerSettings.Reports')}
          settingsTitle={'All'}
          hideDivider={false}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
        <VerticalSplitRow
          onPress={() => {}}
          title={i18n.t('map.layerSettings.Reports')}
          settingsTitle={'All'}
          hideDivider={false}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
      </ScrollView>
      <View style={styles.basemapContainer}>
        <SettingsButton title={i18n.t('map.layerSettings.Basemap')} />
      </View>
    </View>
  );
};

export default MapSidebar;
