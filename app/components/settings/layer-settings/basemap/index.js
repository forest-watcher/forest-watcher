// @flow
import type { BasemapsState } from 'types/basemaps.types';
import type { Layer } from 'types/layers.types';

import React, { PureComponent } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';

import { GFW_BASEMAPS } from 'config/constants';
import debounceUI from 'helpers/debounceUI';

const basemapPlaceholder = require('assets/basemap_placeholder.png');

type Props = {
  componentId: string,
  featureId: string,
  basemaps: BasemapsState,
  activeBasemapId: string,
  offlineMode: boolean,
  selectActiveBasemap: (string, string) => {}
};

class BasemapLayerSettings extends PureComponent<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.basemaps')
        }
      }
    };
  }

  onPressManageBasemap = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.MappingFiles',
        passProps: {
          mappingFileType: 'basemap'
        }
      }
    });
  });

  selectBasemap = (basemap: Layer) => {
    this.props.selectActiveBasemap(this.props.featureId, basemap.id);
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.heading}>{i18n.t('map.layerSettings.gfwBasemaps')}</Text>
          {GFW_BASEMAPS.map(basemap => {
            const disabled = this.props.offlineMode && !!basemap.url;
            return (
              <VerticalSplitRow
                key={basemap.id}
                style={styles.rowContainer}
                disabled={disabled}
                onPress={() => {
                  this.selectBasemap(basemap);
                }}
                title={i18n.t(`basemaps.names.` + basemap.name)}
                subtitle={disabled ? i18n.t(`map.layerSettings.onlyAvailableOnline`) : null}
                selected={this.props.activeBasemapId === basemap.id}
                imageSrc={basemap.image || basemapPlaceholder}
                useRadioIcon
              />
            );
          })}
          {this.props.basemaps.importedBasemaps.length > 0 && (
            <Text style={styles.heading}>{i18n.t('map.layerSettings.customBasemaps')}</Text>
          )}
          {this.props.basemaps.importedBasemaps.map(basemap => {
            return (
              <VerticalSplitRow
                key={basemap.id}
                style={styles.rowContainer}
                onPress={() => {
                  this.selectBasemap(basemap);
                }}
                title={basemap.name}
                selected={this.props.activeBasemapId === basemap.id}
                imageSrc={basemapPlaceholder}
                useRadioIcon
              />
            );
          })}
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton
            onPress={this.onPressManageBasemap}
            text={i18n.t('map.layerSettings.manageBasemaps')}
            transparent
            noIcon
          />
        </BottomTray>
      </View>
    );
  }
}

export default BasemapLayerSettings;
