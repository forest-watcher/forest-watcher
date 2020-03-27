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

type ReportsLayerSettingsType = {
  layerIsActive: boolean,
  myReportsActive: boolean,
  importedReportsActive: boolean
};

type Props = {
  reportsLayerSettings: ReportsLayerSettingsType,
  toggleMyReportsLayer: () => void,
  toggleImportedReportsLayer: () => void
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
    if (this.props.reportsLayerSettings.myReportsActive) {
      this.props.toggleMyReportsLayer();
    }
    if (this.props.reportsLayerSettings.importedReportsActive) {
      this.props.toggleImportedReportsLayer();
    }
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
          <VerticalSplitRow
            title={i18n.t('map.layerSettings.myReports')}
            selected={this.props.reportsLayerSettings.myReportsActive}
            onPress={this.props.toggleMyReportsLayer}
            legend={[{ title: i18n.t('map.layerSettings.report'), color: Theme.colors.report }]}
            style={styles.rowContainer}
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
          <VerticalSplitRow
            title={i18n.t('map.layerSettings.importedReports')}
            selected={this.props.reportsLayerSettings.importedReportsActive}
            onPress={this.props.toggleImportedReportsLayer}
            legend={[{ title: i18n.t('map.layerSettings.report'), color: Theme.colors.importedReport }]}
            style={styles.rowContainer}
            hideImage
            smallerVerticalPadding
            largerLeftPadding
          />
        </ScrollView>
        <BottomTray>
          <ActionButton onPress={() => {}} text={i18n.t('map.layerSettings.manageReports')} transparent noIcon />
        </BottomTray>
      </View>
    );
  }
}

export default ContextualLayersLayerSettings;
