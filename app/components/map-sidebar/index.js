// @flow

import React, { PureComponent } from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import SettingsButton from 'components/common/settings-button';
import i18n from 'i18next';
import type { LayerSettings, LayerSettingsAction } from 'types/layerSettings.types';
import debounceUI from 'helpers/debounceUI';
import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';
import type { Basemap } from 'types/basemaps.types';
const SafeAreaView = withSafeArea(View, 'padding', 'bottom');

type Props = {
  areaId: ?string,
  featureId: string,
  allLayerSettings: { [featureId: string]: LayerSettings },
  defaultLayerSettings: LayerSettings,
  getActiveBasemap: (featureId: string) => Basemap,
  toggleAlertsLayer: string => LayerSettingsAction,
  toggleRoutesLayer: string => LayerSettingsAction,
  toggleReportsLayer: string => LayerSettingsAction,
  toggleContextualLayersLayer: string => LayerSettingsAction
};

class MapSidebar extends PureComponent<Props, null> {
  static options(passProps: {}) {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  awaitingPushComponentName: ?string = null;

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  componentDidDisappear() {
    if (Platform.OS === 'ios' && this.awaitingPushComponentName) {
      Navigation.push('ForestWatcher.Map', {
        component: {
          name: this.awaitingPushComponentName,
          passProps: {
            featureId: this.props.featureId
          }
        }
      });
      this.awaitingPushComponentName = null;
    }
  }

  pushScreen = (componentName: string) => {
    if (Platform.OS === 'ios') {
      this.awaitingPushComponentName = componentName;
    }

    // close layers drawer
    Navigation.mergeOptions('ForestWatcher.Map', {
      sideMenu: {
        right: {
          visible: false
        }
      }
    });

    // On iOS we need to wait until `mergeOptions event is seen!`
    if (Platform.OS === 'android') {
      // push new screen using map screen's componentId
      Navigation.push('ForestWatcher.Map', {
        component: {
          name: componentName,
          passProps: {
            featureId: this.props.featureId
          }
        }
      });
    }
  };

  openAlertLayerSettings = debounceUI(() => {
    this.pushScreen('ForestWatcher.AlertLayerSettings');
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

  getAlertsSettingsTitle = (layerSettings: LayerSettings) => {
    const { glad, viirs, layerIsActive } = layerSettings.alerts;
    let alerts;
    if (glad.active) {
      alerts = i18n.t('map.layerSettings.alertSettings.glad');
      if (viirs.active) {
        alerts += ', ' + i18n.t('map.layerSettings.alertSettings.viirs');
      }
    } else {
      if (viirs.active) {
        alerts = i18n.t('map.layerSettings.alertSettings.viirs');
      } else {
        alerts = i18n.t('map.layerSettings.alertSettings.noAlerts');
      }
    }
    if (layerIsActive) {
      return i18n.t('map.layerSettings.showing', { description: alerts });
    }
    return alerts;
  };

  getRoutesSettingsTitle = (layerSettings: LayerSettings) => {
    const { showAll, activeRouteIds, layerIsActive } = layerSettings.routes;
    let description;
    if (showAll) {
      description = i18n.t('map.layerSettings.routeSettings.showingAllRoutes');
    } else {
      const count = activeRouteIds.length;
      description = i18n.t(
        count === 1
          ? 'map.layerSettings.routeSettings.showingOneRoute'
          : 'map.layerSettings.routeSettings.showingManyRoutes',
        { count }
      );
    }

    if (layerIsActive) {
      return i18n.t('map.layerSettings.showing', { description });
    }
    return description;
  };

  getReportSettingsTitle = (layerSettings: LayerSettings) => {
    const { myReportsActive, importedReportsActive, layerIsActive } = layerSettings.reports;
    let description;
    if (myReportsActive) {
      description = i18n.t(
        importedReportsActive
          ? 'map.layerSettings.reportSettings.showingAllReports'
          : 'map.layerSettings.reportSettings.showingMyReports'
      );
    } else {
      description = i18n.t(
        importedReportsActive
          ? 'map.layerSettings.reportSettings.showingImportedReports'
          : 'map.layerSettings.reportSettings.showingNoReports'
      );
    }

    if (layerIsActive) {
      return i18n.t('map.layerSettings.showing', { description });
    }
    return description;
  };

  getContextualLayersSettingsTitle = (layerSettings: LayerSettings) => {
    const { activeContextualLayerIds, layerIsActive } = layerSettings.contextualLayers;
    const count = activeContextualLayerIds.length;
    const description = i18n.t(
      count === 1
        ? 'map.layerSettings.contextualLayersSettings.showingOneContextualLayer'
        : 'map.layerSettings.contextualLayersSettings.showingManyContextualLayers',
      { count }
    );
    if (layerIsActive) {
      return i18n.t('map.layerSettings.showing', { description });
    }
    return description;
  };

  getBasemapsTitle = (): string => {
    if (!this.props.featureId) {
      return '';
    }
    const basemap: Basemap = this.props.getActiveBasemap(this.props.featureId);
    const basemapName = basemap.isCustom ? basemap.name : i18n.t(`basemaps.names.` + basemap.name);
    return i18n.t('map.layerSettings.basemapSettings.showingBasemap', { basemap: basemapName });
  };

  render() {
    const { allLayerSettings, defaultLayerSettings, featureId } = this.props;
    const layerSettings = featureId && allLayerSettings[featureId] ? allLayerSettings[featureId] : defaultLayerSettings;
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
            onIconPress={() => {
              if (!featureId) {
                return;
              }

              this.props.toggleAlertsLayer(featureId);
            }}
            onSettingsPress={this.openAlertLayerSettings}
            title={i18n.t('map.layerSettings.alerts')}
            settingsTitle={this.getAlertsSettingsTitle(layerSettings)}
            selected={layerSettings.alerts.layerIsActive}
            disableSettingsButton={!this.props.areaId}
            disableStyleSettingsButton={!this.props.areaId || !layerSettings.alerts.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onIconPress={() => {
              if (!featureId) {
                return;
              }

              this.props.toggleRoutesLayer(featureId);
            }}
            onSettingsPress={this.openRoutesLayerSettings}
            title={i18n.t('map.layerSettings.routes')}
            settingsTitle={this.getRoutesSettingsTitle(layerSettings)}
            selected={layerSettings.routes.layerIsActive}
            disableStyleSettingsButton={!layerSettings.routes.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onIconPress={() => {
              if (!featureId) {
                return;
              }

              this.props.toggleReportsLayer(featureId);
            }}
            onSettingsPress={this.openReportsLayerSettings}
            title={i18n.t('map.layerSettings.reports')}
            settingsTitle={this.getReportSettingsTitle(layerSettings)}
            selected={layerSettings.reports.layerIsActive}
            disableStyleSettingsButton={!layerSettings.reports.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onIconPress={() => {
              if (!featureId) {
                return;
              }

              this.props.toggleContextualLayersLayer(featureId);
            }}
            onSettingsPress={this.openContextualLayersLayerSettings}
            title={i18n.t('map.layerSettings.contextualLayers')}
            settingsTitle={this.getContextualLayersSettingsTitle(layerSettings)}
            selected={layerSettings.contextualLayers.layerIsActive}
            disableStyleSettingsButton={!layerSettings.contextualLayers.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
        </ScrollView>
        <SafeAreaView style={styles.basemapContainer}>
          <SettingsButton title={this.getBasemapsTitle()} onPress={this.openBasemapLayerSettings} />
        </SafeAreaView>
      </View>
    );
  }
}

export default MapSidebar;
