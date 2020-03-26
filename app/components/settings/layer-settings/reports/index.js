// @flow

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import type { LayerSettingsState } from 'types/layerSettings.types';

type Props = {
  layerSettings: LayerSettingsState,
  toggleAlertsLayer: () => void,
  toggleRoutesLayer: () => void,
  toggleReportsLayer: () => void,
  toggleContextualLayersLayer: () => void
};

const ReportLayerSettings = (props: Props) => {
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
          title={i18n.t('map.layerSettings.alerts')}
          settingsTitle={'omg'}
          selected={props.layerSettings.alerts.layerIsActive}
          style={styles.rowContainer}
          hideDivider
          hideImage
          smallerVerticalPadding
          largerLeftPadding
        />
      </ScrollView>
    </View>
  );
};

export default ReportLayerSettings;
