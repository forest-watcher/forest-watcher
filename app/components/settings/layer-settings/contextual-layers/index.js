// @flow

import React, { PureComponent } from 'react';
import { Image, View, ScrollView, Text } from 'react-native';
import styles from './styles';
import i18n from 'i18next';
import ActionsRow from 'components/common/actions-row';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';

import type { ContextualLayer } from 'types/layers.types';
import type { LayerSettingsAction } from 'types/layerSettings.types';
import debounceUI from 'helpers/debounceUI';

const layerPlaceholder = require('assets/layerPlaceholder.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type ContextualLayersLayerSettingsType = {
  layerIsActive: boolean,
  activeContextualLayerIds: Array<string>
};

type Props = {
  baseApiLayers: ?Array<ContextualLayer>,
  componentId: string,
  featureId: string,
  clearEnabledContextualLayers: string => LayerSettingsAction,
  contextualLayersLayerSettings: ContextualLayersLayerSettingsType,
  importedContextualLayers: Array<ContextualLayer>,
  setContextualLayerShowing: (featureId: string, layerId: string, showing: boolean) => LayerSettingsAction
};

class ContextualLayersLayerSettings extends PureComponent<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.contextualLayers')
        },
        rightButtons: [
          {
            id: 'clear',
            text: i18n.t('commonText.clear'),
            ...styles.topBarTextButton
          }
        ]
      }
    };
  }

  constructor(props: Props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }: NavigationButtonPressedEvent) {
    if (buttonId === 'clear') {
      this.clearAllOptions();
    }
  }

  setContextualLayerShowing = (layerId: string, showing: boolean) => {
    this.props.setContextualLayerShowing(this.props.featureId, layerId, showing);
  };

  clearAllOptions = () => {
    this.props.clearEnabledContextualLayers(this.props.featureId);
  };

  onPressManageContextualLayers = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.MappingFiles',
        passProps: {
          mappingFileType: 'contextual_layer'
        }
      }
    });
  });

  renderGFWLayers = () => {
    const { baseApiLayers, contextualLayersLayerSettings } = this.props;
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t('map.layerSettings.gfwLayers')}</Text>
        </View>
        {baseApiLayers?.map((layer, index) => {
          const selected = contextualLayersLayerSettings.activeContextualLayerIds.includes(layer.id);
          return (
            <ActionsRow
              style={styles.rowContent}
              imageSrc={layerPlaceholder}
              onPress={this.setContextualLayerShowing.bind(this, layer.id, !selected)}
              key={index}
            >
              <Text style={styles.rowLabel}>{i18n.t(layer.name)}</Text>
              <Image source={selected ? checkboxOn : checkboxOff} />
            </ActionsRow>
          );
        })}
      </View>
    );
  };

  renderImportedLayers = () => {
    const { contextualLayersLayerSettings, importedContextualLayers } = this.props;
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t('map.layerSettings.customLayers')}</Text>
        </View>
        {importedContextualLayers.map((layerFile, index) => {
          const selected = contextualLayersLayerSettings.activeContextualLayerIds.includes(layerFile.id);
          return (
            <ActionsRow
              style={styles.rowContent}
              imageSrc={layerPlaceholder}
              onPress={this.setContextualLayerShowing.bind(this, layerFile.id, !selected)}
              key={index}
            >
              <Text style={styles.rowLabel}>{layerFile.name}</Text>
              <Image source={selected ? checkboxOn : checkboxOff} />
            </ActionsRow>
          );
        })}
      </View>
    );
  };

  render() {
    const { baseApiLayers, importedContextualLayers } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {(baseApiLayers?.length ?? 0) > 0 && this.renderGFWLayers()}
          {importedContextualLayers.length > 0 && this.renderImportedLayers()}
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton
            onPress={this.onPressManageContextualLayers}
            text={i18n.t('map.layerSettings.manageContextualLayers')}
            transparent
            noIcon
          />
        </BottomTray>
      </View>
    );
  }
}

export default ContextualLayersLayerSettings;
