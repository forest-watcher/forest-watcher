// @flow

import React, { PureComponent } from 'react';
import { View, ScrollView, Text } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import type { Basemap, BasemapsState } from 'types/basemaps.types';

const basemapPlaceholder = require('assets/basemap_placeholder.png');

type Props = {
  featureId: string,
  basemaps: BasemapsState,
  activeBasemapId: string,
  selectActiveBasemap: (string, string) => {}
};

class BasemapLayerSettings extends PureComponent<Props> {
  static options(passProps: Props) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.basemaps')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'clear') {
      this.clearAllOptions(); // TODO: this doesn't exist?
    }
  }

  selectBasemap = (basemap: Basemap) => {
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
          {this.props.basemaps.gfwBasemaps.map(basemap => {
            return (
              <VerticalSplitRow
                key={basemap.id}
                style={styles.rowContainer}
                onPress={() => {
                  this.selectBasemap(basemap);
                }}
                title={basemap.name}
                selected={this.props.activeBasemapId === basemap.id}
                imageSrc={basemap.image || basemapPlaceholder}
                useRadioIcon
              />
            );
          })}
          {this.props.basemaps.importedBasemaps.length > 0 && (
            <Text style={styles.heading}>{i18n.t('map.layerSettings.importedBasemaps')}</Text>
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
                hideImage
                useRadioIcon
              />
            );
          })}
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton onPress={() => {}} text={i18n.t('map.layerSettings.manageBasemaps')} transparent noIcon />
        </BottomTray>
      </View>
    );
  }
}

export default BasemapLayerSettings;
