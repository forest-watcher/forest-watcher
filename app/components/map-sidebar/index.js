// @flow

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import SettingsButton from 'components/common/settings-button';

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
          title={'Alerts'}
          settingsTitle={'omg'}
          hideDivider={true}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
        <VerticalSplitRow
          onPress={() => {}}
          title={'Routes'}
          settingsTitle={'All'}
          hideDivider={true}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
        <VerticalSplitRow
          onPress={() => {}}
          title={'Reports'}
          settingsTitle={'All'}
          hideDivider={true}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
        <VerticalSplitRow
          onPress={() => {}}
          title={'Contextual Layers'}
          settingsTitle={'All'}
          hideDivider={true}
          selected={true}
          style={styles.rowContainer}
          hideImage
        />
      </ScrollView>
      <View style={styles.basemapContainer}>
        <SettingsButton title={'Basemap'} />
      </View>
    </View>
  );
};

export default MapSidebar;
