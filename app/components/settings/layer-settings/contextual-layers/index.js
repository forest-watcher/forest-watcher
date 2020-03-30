// @flow

import React, { PureComponent } from 'react';
import { Image, View, ScrollView, Text } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import Theme from 'config/theme';
import ActionsRow from 'components/common/actions-row';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation } from 'react-native-navigation';

import { formatBytes } from 'helpers/data';

import type { File } from 'types/file.types';

const layerPlaceholder = require('assets/layerPlaceholder.png');
const checkboxOff = require('assets/checkbox_off.png');
const checkboxOn = require('assets/checkbox_on.png');

type ContextualLayersLayerSettingsType = {
  layerIsActive: boolean,
  myReportsActive: boolean,
  importedReportsActive: boolean
};

type Props = {
  contextualLayersLayerSettings: ContextualLayersLayerSettingsType,
  importedContextualLayers: Array<File>,
  toggleContextualLayersLayer: () => void
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

  clearAllOptions = () => {
    
  };

  renderImportedLayers = () => {
    const { contextualLayersLayerSettings, importedContextualLayers } = this.props;
    console.log("Props", this.props);
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
              onPress={null}
              key={index}
            >
              <Text style={styles.rowLabel}>{layerFile.name}</Text>
              <Image source={selected ? checkboxOn : checkboxOff}/>
            </ActionsRow>
          );
        })}
      </View>
    );
  }

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
          <ActionButton onPress={() => {}} text={i18n.t('map.layerSettings.manageContextualLayers')} transparent noIcon />
        </BottomTray>
      </View>
    );
  }
}

export default ContextualLayersLayerSettings;
