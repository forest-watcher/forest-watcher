// @flow

import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';
import styles from './styles';
import i18n from 'i18next';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation } from 'react-native-navigation';

type RoutesLayerSettingsType = {
  layerIsActive: boolean,
  activeRouteIds: Array<string>
};

type Props = {
  featureId: string,
  routesLayerSettings: RoutesLayerSettingsType,
  toggleMyReportsLayer: () => void,
  toggleImportedReportsLayer: () => void
};

class RoutesLayerSettings extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.routes')
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

  clearAllOptions = () => {};

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
        <BottomTray>
          <ActionButton onPress={() => {}} text={i18n.t('map.layerSettings.manageReports')} transparent noIcon />
        </BottomTray>
      </View>
    );
  }
}

export default RoutesLayerSettings;
