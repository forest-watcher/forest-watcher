// @flow

import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation } from 'react-native-navigation';

import type { File } from 'types/file.types';

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
    return (
      <View/>
    )
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
