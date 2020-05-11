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
import type { Thunk } from 'types/store.types';
const SafeAreaView = withSafeArea(View, 'padding', 'bottom');

type Props = {
  componentId: string,
  allLayerSettings: { [featureId: string]: LayerSettings },
  defaultLayerSettings: LayerSettings,
  getActiveBasemap: string => Thunk<Basemap>,
  toggleAlertsLayer: string => LayerSettingsAction,
  toggleRoutesLayer: string => LayerSettingsAction,
  toggleReportsLayer: string => LayerSettingsAction,
  toggleContextualLayersLayer: string => LayerSettingsAction
};

type State = {
  componentId: ?string,
  featureId: ?string
};

class MapSidebar extends PureComponent<Props, State> {
  awaitingPushComponentName: ?string = null;

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
          name: this.awaitingPushComponentName,
          passProps: {
            featureId: this.state.featureId
          }
        }
      });
      this.awaitingPushComponentName = null;
    }
  }

  pushScreen = (componentName: string) => {
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
    if (!this.state.featureId) {
      return '';
    }
    const basemap = this.props.getActiveBasemap(this.state.featureId); // TODO: how should null featureIDs be handled?
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
            onIconPress={() => this.props.toggleAlertsLayer(featureId)}
            onSettingsPress={this.openAlertLayerSettings}
            title={i18n.t('map.layerSettings.alerts')}
            settingsTitle={this.getAlertsSettingsTitle(layerSettings)}
            selected={layerSettings.alerts.layerIsActive}
            disableStyleSettingsButton={!layerSettings.alerts.layerIsActive}
            style={styles.rowContainer}
            hideDivider
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            onIconPress={() => this.props.toggleRoutesLayer(featureId)}
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
            onIconPress={() => this.props.toggleReportsLayer(featureId)}
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
            onIconPress={() => this.props.toggleContextualLayersLayer(featureId)}
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
