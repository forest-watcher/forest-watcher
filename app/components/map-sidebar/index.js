// @flow

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import SettingsButton from 'components/common/settings-button';
import i18n from 'i18next';
import type { LayerSettingsState } from 'types/layerSettings.types';

type Props = {
  layerSettings: LayerSettingsState,
  toggleAlertsLayer: () => void,
  toggleRoutesLayer: () => void,
  toggleReportsLayer: () => void,
  toggleContextualLayersLayer: () => void
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
        <Text style={styles.heading}>{i18n.t('map.layerSettings.layersHeading')}</Text>
        <VerticalSplitRow
          onPress={props.toggleAlertsLayer}
          onSettingsPress={() => {}}
          title={i18n.t('map.layerSettings.alerts')}
          settingsTitle={'omg'}
          selected={props.layerSettings.alerts.layerIsActive}
          style={styles.rowContainer}
          hideDivider
          hideImage
          smallerVerticalPadding
          largerLeftPadding
        />
        <VerticalSplitRow
          onPress={props.toggleRoutesLayer}
          onSettingsPress={() => {}}
          title={i18n.t('map.layerSettings.routes')}
          settingsTitle={'All'}
          selected={props.layerSettings.routes.layerIsActive}
          style={styles.rowContainer}
          hideDivider
          hideImage
          smallerVerticalPadding
          largerLeftPadding
        />
        <VerticalSplitRow
          onPress={props.toggleReportsLayer}
          onSettingsPress={() => {}}
          title={i18n.t('map.layerSettings.reports')}
          settingsTitle={'All'}
          selected={props.layerSettings.reports.layerIsActive}
          style={styles.rowContainer}
          hideDivider
          hideImage
          smallerVerticalPadding
          largerLeftPadding
        />
        <VerticalSplitRow
          onPress={props.toggleContextualLayersLayer}
          onSettingsPress={() => {}}
          title={i18n.t('map.layerSettings.contextualLayers')}
          settingsTitle={'All'}
          selected={props.layerSettings.contextualLayers.layerIsActive}
          style={styles.rowContainer}
          hideDivider
          hideImage
          smallerVerticalPadding
          largerLeftPadding
        />
      </ScrollView>
      <View style={styles.basemapContainer}>
        <SettingsButton title={i18n.t('map.layerSettings.basemap')} />
      </View>
    </View>
  );
};

export default MapSidebar;
