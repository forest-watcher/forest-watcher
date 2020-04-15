// @flow

import React, { PureComponent } from 'react';
import { View, ScrollView, Text } from 'react-native';
import styles from './styles';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import Theme from 'config/theme';
import { Navigation } from 'react-native-navigation';
import Dropdown from 'components/common/dropdown';
import type { Area } from 'types/areas.types';
import { DATASETS } from 'config/constants';

type AlertLayerSettingsType = {
  layerIsActive: boolean,
  glad: {
    active: boolean,
    timeFrame: number
  },
  viirs: {
    active: boolean,
    timeFrame: number
  }
};

type Props = {
  featureId: string,
  area: Area,
  alertLayerSettings: AlertLayerSettingsType,
  toggleGladAlerts: () => void,
  toggleViirsAlerts: () => void,
  setGladAlertsTimeFrame: () => void,
  setViirsAlertsTimeFrame: () => void
};

type Options = Array<{ labelKey: string, value: string }>;

const GLAD_TIME_FRAME_VALUES = [1, 2, 6, 12];
const VIIRS_TIME_FRAME_VALUES = [1, 2, 6, 12];

class AlertLayerSettings extends PureComponent<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('map.layerSettings.alerts')
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
    if (this.props.alertLayerSettings?.glad?.active) {
      this.props.toggleGladAlerts(this.props.featureId);
    }
    if (this.props.alertLayerSettings?.viirs?.active) {
      this.props.toggleViirsAlerts(this.props.featureId);
    }
  };

  onGladAlertsTimeFrameChanged = value => {
    this.props.setGladAlertsTimeFrame(this.props.featureId, value);
  };

  onViirsAlertsTimeFrameChanged = value => {
    this.props.setViirsAlertsTimeFrame(this.props.featureId, value);
  };

  getGladTimeFrameOptions: Options = () => {
    return GLAD_TIME_FRAME_VALUES.map(value => {
      return {
        value,
        labelKey: i18n.t(
          value === 1 ? 'map.layerSettings.alertSettings.oneMonth' : 'map.layerSettings.alertSettings.manyMonths',
          { count: value }
        )
      };
    });
  };

  getViirsTimeFrameOptions: Options = () => {
    return VIIRS_TIME_FRAME_VALUES.map(value => {
      return {
        value,
        labelKey: i18n.t(
          value === 1 ? 'map.layerSettings.alertSettings.oneDay' : 'map.layerSettings.alertSettings.manyDays',
          { count: value }
        )
      };
    });
  };

  render() {
    const areaDatasets = this.props.area.datasets.map(dataset => dataset.slug);
    const showViirs = areaDatasets.includes(DATASETS.VIIRS);
    const showGlad = areaDatasets.includes(DATASETS.GLAD);

    const alertsString = i18n.t('map.layerSettings.alerts');
    const gladTimeFrame = this.props.alertLayerSettings.glad.timeFrame;
    const gladShowingDescription = i18n.t(
      gladTimeFrame === 1
        ? 'map.layerSettings.alertSettings.showingOneMonth'
        : 'map.layerSettings.alertSettings.showingManyMonths',
      { count: gladTimeFrame, type: alertsString }
    );
    const viirsTimeFrame = this.props.alertLayerSettings.viirs.timeFrame;
    const viirsShowingDescription = i18n.t(
      viirsTimeFrame === 1
        ? 'map.layerSettings.alertSettings.showingOneDay'
        : 'map.layerSettings.alertSettings.showingManyDays',
      { count: viirsTimeFrame, type: alertsString }
    );
    const gladActive = this.props.alertLayerSettings.glad.active;
    const viirsActive = this.props.alertLayerSettings.viirs.active;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {showGlad && (
            <React.Fragment>
              <Text style={styles.heading}>{i18n.t('map.layerSettings.alertSettings.deforestation')}</Text>
              <VerticalSplitRow
                title={i18n.t('map.layerSettings.alertSettings.glad')}
                selected={gladActive}
                onPress={() => this.props.toggleGladAlerts(this.props.featureId)}
                legend={[
                  { title: i18n.t('map.layerSettings.alertSettings.alert'), color: Theme.colors.glad },
                  { title: i18n.t('map.layerSettings.alertSettings.recent'), color: Theme.colors.recent },
                  { title: i18n.t('map.layerSettings.alertSettings.reportedOn'), color: Theme.colors.report }
                ]}
                style={styles.rowContainer}
                hideImage
                hideDivider
                smallerVerticalPadding
                largerLeftPadding
              />
              <View style={styles.selectRowContainer}>
                <Text style={styles.smallLabel}>{i18n.t(`map.layerSettings.alertSettings.timeFrame`)}</Text>
                {gladActive && <Text style={styles.bodyText}>{gladShowingDescription}</Text>}
              </View>
              <Dropdown
                label={i18n.t(`map.layerSettings.alertSettings.timeFrame`)}
                description={i18n.t(`map.layerSettings.alertSettings.timeFrameDescMonths`)}
                hideLabel
                selectedValue={gladTimeFrame}
                onValueChange={this.onGladAlertsTimeFrameChanged}
                options={this.getGladTimeFrameOptions()}
                inActive={!gladActive}
              />
            </React.Fragment>
          )}
          {showViirs && (
            <React.Fragment>
              <Text style={styles.heading}>{i18n.t('map.layerSettings.alertSettings.fires')}</Text>
              <VerticalSplitRow
                title={i18n.t('map.layerSettings.alertSettings.viirs')}
                selected={viirsActive}
                onPress={() => this.props.toggleViirsAlerts(this.props.featureId)}
                legend={[
                  { title: i18n.t('map.layerSettings.alertSettings.alert'), color: Theme.colors.viirs },
                  { title: i18n.t('map.layerSettings.alertSettings.reportedOn'), color: Theme.colors.viirsReported }
                ]}
                style={styles.rowContainer}
                hideImage
                hideDivider
                smallerVerticalPadding
                largerLeftPadding
              />
              <View style={styles.selectRowContainer}>
                <Text style={styles.smallLabel}>{i18n.t(`map.layerSettings.alertSettings.timeFrame`)}</Text>
                {viirsActive && <Text style={styles.bodyText}>{viirsShowingDescription}</Text>}
              </View>
              <Dropdown
                label={i18n.t(`map.layerSettings.alertSettings.timeFrame`)}
                description={i18n.t(`map.layerSettings.alertSettings.timeFrameDescDays`)}
                hideLabel
                selectedValue={viirsTimeFrame}
                onValueChange={this.onViirsAlertsTimeFrameChanged}
                options={this.getViirsTimeFrameOptions()}
                inActive={!viirsActive}
              />
            </React.Fragment>
          )}
        </ScrollView>
      </View>
    );
  }
}

export default AlertLayerSettings;
