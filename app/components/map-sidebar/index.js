// @flow

import React, { PureComponent } from 'react';
import { View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import SettingsButton from 'components/common/settings-button';
import i18n from 'i18next';
import type { LayerSettingsState } from 'types/layerSettings.types';
import debounceUI from 'helpers/debounceUI';
import { Navigation } from 'react-native-navigation';

type Props = {
  componentId: string,
  layerSettings: LayerSettingsState,
  toggleAlertsLayer: () => void,
  toggleRoutesLayer: () => void,
  toggleReportsLayer: () => void,
  toggleContextualLayersLayer: () => void
};

class MapSidebar extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      componentId: ''
    };
    Navigation.events().bindComponent(this);

    Navigation.events().registerCommandListener((name, params) => {
      // https://github.com/wix/react-native-navigation/issues/3635
      // Pass componentId so drawer can push screens
      const componentId = params?.options?.sideMenu?.right?.component?.passProps?.componentId;
      if (componentId) {
        this.setState({ componentId });
      }
    });
  }

  pushScreen = componentName => {
    if (!this.state.componentId) {
      return;
    }
    // close layers drawer
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        right: {
          visible: false
        }
      }
    });
    // push new screen using map screen's componentId
    Navigation.push(this.state.componentId, {
      component: {
        name: componentName
      }
    });
  };

  openAlertsLayerSettings = debounceUI(() => {
    this.pushScreen('ForestWatcher.AlertsLayerSettings');
  });

  openRoutesLayerSettings = debounceUI(() => {
    this.pushScreen('ForestWatcher.RoutesLayerSettings');
  });

  openReportsLayerSettings = debounceUI(() => {
    this.pushScreen('ForestWatcher.ReportsLayerSettings');
  });

  openContextualLayersLayerSettings = debounceUI(() => {
    this.pushScreen('ForestWatcher.ContextualLayersLayerSettings');
  });

  openBasemapLayerSettings = debounceUI(() => {
    this.pushScreen('ForestWatcher.BasemapLayerSettings');
  });

  render() {
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
            onPress={this.props.toggleAlertsLayer}
            onSettingsPress={this.openAlertsLayerSettings}
            title={i18n.t('map.layerSettings.alerts')}
            settingsTitle={'omg'}
            selected={this.props.layerSettings.alerts.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onPress={this.props.toggleRoutesLayer}
            onSettingsPress={this.openRoutesLayerSettings}
            title={i18n.t('map.layerSettings.routes')}
            settingsTitle={'All'}
            selected={this.props.layerSettings.routes.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onPress={this.props.toggleReportsLayer}
            onSettingsPress={this.openReportsLayerSettings}
            title={i18n.t('map.layerSettings.reports')}
            settingsTitle={'All'}
            selected={this.props.layerSettings.reports.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onPress={this.props.toggleContextualLayersLayer}
            onSettingsPress={this.openContextualLayersLayerSettings}
            title={i18n.t('map.layerSettings.contextualLayers')}
            settingsTitle={'All'}
            selected={this.props.layerSettings.contextualLayers.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
        </ScrollView>
        <View style={styles.basemapContainer}>
          <SettingsButton title={i18n.t('map.layerSettings.basemap')} onPress={this.openBasemapLayerSettings} />
        </View>
      </View>
    );
  }
}

export default MapSidebar;
