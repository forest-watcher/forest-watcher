// @flow

import React, { PureComponent } from 'react';
import { Image, View, ScrollView, Text } from 'react-native';
import styles from './styles';
import i18n from 'i18next';
import ActionsRow from 'components/common/actions-row';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation } from 'react-native-navigation';

import type { File } from 'types/file.types';

const layerPlaceholder = require('assets/layerPlaceholder.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type ContextualLayersLayerSettingsType = {
  layerIsActive: boolean,
  activeContextualLayerIds: Array<string>
};

type Props = {
  clearEnabledContextualLayers: void => void,
  contextualLayersLayerSettings: ContextualLayersLayerSettingsType,
  importedContextualLayers: Array<File>,
  setContextualLayerShowing: (layerId: string, showing: boolean) => void
};

class ContextualLayersLayerSettings extends PureComponent<Props> {
  static options(passProps) {
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

  constructor(props) {
    super(props);
    Navigation.events().bindComponent(this);
  }

  navigationButtonPressed({ buttonId }) {
    if (buttonId === 'clear') {
      this.clearAllOptions();
    }
  }

  setContextualLayerShowing = (layerId: string, showing: boolean) => {
    this.props.setContextualLayerShowing(layerId, showing);
  };

  clearAllOptions = () => {
    this.props.clearEnabledContextualLayers();
  };

  renderImportedLayers = () => {
    const { contextualLayersLayerSettings, importedContextualLayers } = this.props;
    return (
      <View>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{i18n.t('map.layerSettings.customLayers')}</Text>
        </View>
        {importedContextualLayers.map((layerFile, index) => {
          // Imported files are uniquely identifiable by name, as we ensure this when importing!
          // May need to adjust when are shared...
          const selected = contextualLayersLayerSettings.activeContextualLayerIds.includes(layerFile.name);
          return (
            <ActionsRow
              style={styles.rowContent}
              imageSrc={layerPlaceholder}
              onPress={this.setContextualLayerShowing.bind(this, layerFile.name, selected ? false : true)}
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
    const { importedContextualLayers } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {importedContextualLayers.length > 0 && this.renderImportedLayers()}
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton
            onPress={() => {}}
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
