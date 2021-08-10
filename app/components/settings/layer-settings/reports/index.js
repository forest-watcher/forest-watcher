// @flow
import React, { PureComponent } from 'react';
import { View, ScrollView } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import Theme from 'config/theme';
import ActionButton from 'components/common/action-button';
import BottomTray from 'components/common/bottom-tray';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import debounceUI from 'helpers/debounceUI';

type ReportsLayerSettingsType = {
  layerIsActive: boolean,
  myReportsActive: boolean,
  importedReportsActive: boolean
};

type Props = {
  componentId: string,
  featureId: string,
  reportsLayerSettings: ReportsLayerSettingsType,
  toggleMyReportsLayer: string => void,
  toggleImportedReportsLayer: string => void
};

class ReportLayerSettings extends PureComponent<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.reports')
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

  clearAllOptions = () => {
    if (this.props.reportsLayerSettings.myReportsActive) {
      this.props.toggleMyReportsLayer(this.props.featureId);
    }
    if (this.props.reportsLayerSettings.importedReportsActive) {
      this.props.toggleImportedReportsLayer(this.props.featureId);
    }
  };

  onPressManageReports = debounceUI(() => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Reports'
      }
    });
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
          <VerticalSplitRow
            title={i18n.t('map.layerSettings.myReports')}
            selected={this.props.reportsLayerSettings.myReportsActive}
            onPress={() => this.props.toggleMyReportsLayer(this.props.featureId)}
            legend={[{ title: i18n.t('map.layerSettings.report'), color: Theme.colors.report }]}
            style={styles.rowContainer}
            hideImage
            smallerVerticalPadding
            largerPadding
          />
          <VerticalSplitRow
            title={i18n.t('map.layerSettings.importedReports')}
            selected={this.props.reportsLayerSettings.importedReportsActive}
            onPress={() => this.props.toggleImportedReportsLayer(this.props.featureId)}
            legend={[{ title: i18n.t('map.layerSettings.report'), color: Theme.colors.importedReport }]}
            style={styles.rowContainer}
            hideImage
            smallerVerticalPadding
            largerPadding
          />
        </ScrollView>
        <BottomTray requiresSafeAreaView>
          <ActionButton
            onPress={this.onPressManageReports}
            text={i18n.t('map.layerSettings.manageReports')}
            transparent
            noIcon
          />
        </BottomTray>
      </View>
    );
  }
}

export default ReportLayerSettings;
