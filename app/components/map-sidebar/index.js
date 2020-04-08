// @flow

import React, { PureComponent } from 'react';
import { Platform, View, Text, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import SettingsButton from 'components/common/settings-button';
import i18n from 'i18next';
import type { LayerSettings } from 'types/layerSettings.types';
import debounceUI from 'helpers/debounceUI';
import { Navigation } from 'react-native-navigation';
import { withSafeArea } from 'react-native-safe-area';
import type { Basemap } from 'types/basemaps.types';
const SafeAreaView = withSafeArea(View, 'padding', 'bottom');

type Props = {
  componentId: string,
  activeBasemapName: string,
  allLayerSettings: { [featureId: string]: LayerSettings },
  defaultLayerSettings: LayerSettings,
  getActiveBasemap: () => Basemap,
  toggleAlertsLayer: () => void,
  toggleRoutesLayer: () => void,
  toggleReportsLayer: () => void,
  toggleContextualLayersLayer: () => void
};

class MapSidebar extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {
      componentId: null,
      featureId: null
    };
    Navigation.events().bindComponent(this);

    Navigation.events().registerCommandListener((name, params) => {
      // https://github.com/wix/react-native-navigation/issues/3635
      // Pass componentId so drawer can push screens
      const passedProps = params?.options?.sideMenu?.right?.component?.passProps;
      if (!passedProps) {
        return;
      }
      const { componentId, featureId } = passedProps;
      if (componentId) {
        this.setState({ componentId, featureId });
      }
    });
  }

  componentDidDisappear() {
    if (Platform.OS === 'ios' && this.awaitingPushComponentName) {
      Navigation.push(this.state.componentId, {
        component: {
          name: this.awaitingPushComponentName
        }
      });
      this.awaitingPushComponentName = null;
    }
  }

  pushScreen = componentName => {
    if (!this.state.componentId) {
      return;
    }

    if (Platform.OS === 'ios') {
      this.awaitingPushComponentName = componentName;
    }

    // close layers drawer
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        right: {
          visible: false
        }
      }
    });

    // On iOS we need to wait until `mergeOptions event is seen!`
    if (Platform.OS === 'android') {
      // push new screen using map screen's componentId
      Navigation.push(this.state.componentId, {
        component: {
          name: componentName,
          passProps: {
            featureId: this.state.featureId
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

  getAlertsSettingsTitle = layerSettings => {
    const { glad, viirs } = layerSettings.alerts;
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
    return i18n.t('map.layerSettings.alertSettings.showingAlerts', { alerts });
  };

  getRoutesSettingsTitle = layerSettings => {
    if (layerSettings.routes.showAll) {
      return i18n.t('map.layerSettings.routeSettings.showingAllRoutes');
    }
    const count = layerSettings.routes.activeRouteIds.length;
    return i18n.t('map.layerSettings.routeSettings.showingRoutes', { count });
  };

  getReportSettingsTitle = layerSettings => {
    const { myReportsActive, importedReportsActive } = layerSettings.reports;
    if (myReportsActive) {
      return i18n.t(
        importedReportsActive
          ? 'map.layerSettings.reportSettings.showingAllReports'
          : 'map.layerSettings.reportSettings.showingMyReports'
      );
    } else {
      return i18n.t(
        importedReportsActive
          ? 'map.layerSettings.reportSettings.showingImportedReports'
          : 'map.layerSettings.reportSettings.showingNoReports'
      );
    }
  };

  getContextualLayersSettingsTitle = layerSettings => {
    const count = layerSettings.contextualLayers.activeContextualLayerIds.length;
    return i18n.t('map.layerSettings.contextualLayersSettings.showingContextualLayers', { count });
  };

  getBasemapsTitle = () => {
    const basemap = this.props.getActiveBasemap(this.state.featureId);
    return i18n.t('map.layerSettings.basemapSettings.showingBasemap', { basemap: basemap.name });
  };

  render() {
    const { allLayerSettings, defaultLayerSettings } = this.props;
    const { featureId } = this.state;
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
            onPress={() => this.props.toggleAlertsLayer(featureId)}
            onSettingsPress={this.openAlertLayerSettings}
            title={i18n.t('map.layerSettings.alerts')}
            settingsTitle={this.getAlertsSettingsTitle(layerSettings)}
            selected={layerSettings.alerts.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onPress={() => this.props.toggleRoutesLayer(featureId)}
            onSettingsPress={this.openRoutesLayerSettings}
            title={i18n.t('map.layerSettings.routes')}
            settingsTitle={this.getRoutesSettingsTitle(layerSettings)}
            selected={layerSettings.routes.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onPress={() => this.props.toggleReportsLayer(featureId)}
            onSettingsPress={this.openReportsLayerSettings}
            title={i18n.t('map.layerSettings.reports')}
            settingsTitle={this.getReportSettingsTitle(layerSettings)}
            selected={layerSettings.reports.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onPress={() => this.props.toggleContextualLayersLayer(featureId)}
            onSettingsPress={this.openContextualLayersLayerSettings}
            title={i18n.t('map.layerSettings.contextualLayers')}
            settingsTitle={this.getContextualLayersSettingsTitle(layerSettings)}
            selected={layerSettings.contextualLayers.layerIsActive}
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
