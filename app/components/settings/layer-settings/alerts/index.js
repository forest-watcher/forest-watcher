// @flow

import type { Area } from 'types/areas.types';
import type { AlertLayerSettingsType, LayerSettingsAction } from 'types/layerSettings.types';
import type { FilterThreshold } from 'types/alerts.types';
import React, { PureComponent } from 'react';
import { View, ScrollView, Text } from 'react-native';
import styles from './styles';
import Row from 'components/common/row';
import VerticalSplitRow from 'components/common/vertical-split-row';
import i18n from 'i18next';
import { Navigation, NavigationButtonPressedEvent } from 'react-native-navigation';
import Dropdown from 'components/common/dropdown';
import { DATASET_CATEGORIES } from 'config/constants';
import _ from 'lodash';

const nextIcon = require('assets/next.png');

type Props = {
  componentId: string,
  featureId: string,
  area: ?Area,
  alertLayerSettings: AlertLayerSettingsType,
  toggleAlertsDataset: (string, string, string) => void,
  toggleAlertsCategoryAlerts: (string, string) => void,
  clearEnabledAlertTypes: string => void,
  setAlertsCategoryAlertsTimeFrame: (string, string, FilterThreshold) => LayerSettingsAction
};

type Options = Array<{ labelKey: string, value: number, id: string, units: string }>;

class AlertLayerSettings extends PureComponent<Props> {
  static options(passProps: {}) {
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
    this.props.clearEnabledAlertTypes(this.props.featureId);
  };

  onTimeFrameChanged = (categoryId: string, value: Options) => {
    // We don't want to send the whole `Options` here
    this.props.setAlertsCategoryAlertsTimeFrame(this.props.featureId, categoryId, {
      units: value.units,
      value: value.value
    });
  };

  getFilterThresholdOptions = (datasetCategory: AlertDatasetCategory): Options => {
    const { filterThresholds } = datasetCategory;
    return filterThresholds.map(threshold => {
      const { units, value } = threshold;
      let labelKeyLocalisationKey = '';
      switch (units) {
        case 'months':
          labelKeyLocalisationKey = `map.layerSettings.alertSettings.${value === 1 ? 'oneMonth' : 'manyMonths'}`;
          break;
        case 'days':
          labelKeyLocalisationKey = `map.layerSettings.alertSettings.${value === 1 ? 'oneDay' : 'manyDays'}`;
          break;
        case 'weeks':
          labelKeyLocalisationKey = `map.layerSettings.alertSettings.${value === 1 ? 'oneWeek' : 'manyWeeks'}`;
      }
      return {
        value,
        labelKey: i18n.t(labelKeyLocalisationKey, { count: value }),
        id: units + value, // Yay javascript!,
        units: units
      };
    });
  };

  getFilterThresholdDescription = (filterThresholdUnits: string, timeFrame: number, alertsString: string): string => {
    let showingDescription = '';
    switch (filterThresholdUnits) {
      case 'months':
        showingDescription = i18n.t(
          timeFrame === 1
            ? 'map.layerSettings.alertSettings.showingOneMonth'
            : 'map.layerSettings.alertSettings.showingManyMonths',
          { count: timeFrame, type: alertsString }
        );
        break;
      case 'days':
        showingDescription = i18n.t(
          timeFrame === 1
            ? 'map.layerSettings.alertSettings.showingOneDay'
            : 'map.layerSettings.alertSettings.showingManyDays',
          { count: timeFrame, type: alertsString }
        );
        break;
      case 'weeks':
        showingDescription = i18n.t(
          timeFrame === 1
            ? 'map.layerSettings.alertSettings.showingOneWeek'
            : 'map.layerSettings.alertSettings.showingManyWeeks',
          { count: timeFrame, type: alertsString }
        );
    }
    return showingDescription;
  };

  handleFAQLink = (question: FAQQuestion) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.FaqDetail',
        passProps: {
          contentFaq: question.content,
          title: question.title
        }
      }
    });
  };

  render() {
    const areaDatasets = this.props.area?.datasets?.map(dataset => dataset.slug) ?? [];
    const alertsString = i18n.t('map.layerSettings.alerts');
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          {Object.values(DATASET_CATEGORIES).map(datasetCategory => {
            const { datasetSlugs, faqCategory, faqQuestionId, faqTitleKey, id, filterThresholds } = datasetCategory;
            const show =
              datasetSlugs.findIndex(datasetId => {
                return areaDatasets.includes(datasetId);
              }) !== -1;
            if (!show) {
              return null;
            }
            const { activeSlugs, timeFrame } = this.props.alertLayerSettings[id];
            const allActive = activeSlugs.length === datasetSlugs.length;
            const active = activeSlugs.length > 0;
            const showingDescription = this.getFilterThresholdDescription(
              timeFrame.units,
              timeFrame.value,
              alertsString
            );

            const uniqueThresholdUnits = _.uniq(filterThresholds.map(threshold => threshold.units));
            let dropdownDesc = i18n.t('map.layerSettings.alertSettings.timeFrameDescMultiple');
            if (uniqueThresholdUnits.length === 1) {
              switch (uniqueThresholdUnits[0]) {
                case 'months':
                  dropdownDesc = i18n.t(`map.layerSettings.alertSettings.timeFrameDescMonths`);
                  break;
                case 'days':
                  dropdownDesc = i18n.t(`map.layerSettings.alertSettings.timeFrameDescDays`);
                  break;
                case 'weeks':
                  dropdownDesc = i18n.t(`map.layerSettings.alertSettings.timeFrameDescWeeks`);
                  break;
              }
            }

            const multipleDatasets = datasetSlugs.length > 1;
            const mainToggleTitle = multipleDatasets
              ? i18n.t('map.layerSettings.alertSettings.all')
              : i18n.t(`map.layerSettings.alertSettings.${datasetSlugs[0]}`);

            let faqQuestion;
            if (faqCategory && faqQuestionId) {
              const category = i18n.t(`faq.categories.${faqCategory}`, { returnObjects: true });
              // If category is missing in language file, then i18n.t will return a string
              // which will cause category.questions.find to crash app
              if (category && typeof category === 'object') {
                faqQuestion = category.questions.find(question => question.id === faqQuestionId);
              }
            }

            let subtitle = null;
            const subtitleKey = `map.layerSettings.alertSettings.${datasetCategory.id}Subtitle`;
            if (i18n.exists(subtitleKey)) {
              subtitle = i18n.t(subtitleKey);
            }

            return (
              <React.Fragment key={datasetCategory.id}>
                <Text style={styles.heading}>{i18n.t(`map.layerSettings.alertSettings.${datasetCategory.id}`)}</Text>
                <VerticalSplitRow
                  title={mainToggleTitle}
                  selected={allActive}
                  onPress={() => this.props.toggleAlertsCategoryAlerts(this.props.featureId, id)}
                  legend={[
                    { title: i18n.t('map.layerSettings.alertSettings.alert'), color: datasetCategory.color },
                    {
                      title: i18n.t('map.layerSettings.alertSettings.reportedOn'),
                      color: datasetCategory.colorReported
                    }
                  ]}
                  style={!multipleDatasets ? styles.rowContainer : {}}
                  subtitle={subtitle}
                  subtitleBelowLegend
                  subtitleStyle={styles.subtitle}
                  hideImage
                  hideDivider
                  smallerVerticalPadding
                  largerPadding
                />
                {multipleDatasets &&
                  datasetSlugs.map((slug, index) => {
                    const slugActive = activeSlugs.includes(slug);
                    return (
                      <VerticalSplitRow
                        key={slug}
                        title={i18n.t(`map.layerSettings.alertSettings.${slug}`)}
                        selected={slugActive}
                        onPress={() => this.props.toggleAlertsDataset(this.props.featureId, id, slug)}
                        hideImage
                        hideDivider
                        smallerVerticalPadding
                        subtitleStyle={[styles.subtitle, { marginTop: 0 }]}
                        largerPadding
                        style={index === datasetSlugs.length - 1 && !faqQuestion ? styles.rowContainer : {}}
                        subtitle={i18n.t(`map.layerSettings.alertSettings.${slug}Description`)}
                      />
                    );
                  })}
                {faqQuestion && (
                  <Row
                    action={{
                      callback: this.handleFAQLink.bind(this, faqQuestion),
                      icon: nextIcon
                    }}
                    rowStyle={styles.row}
                    style={{ flex: 1 }}
                  >
                    <Text style={styles.rowTitleLabel}>{faqTitleKey ? i18n.t(faqTitleKey) : faqQuestion.title}</Text>
                  </Row>
                )}
                <View style={styles.selectRowContainer}>
                  <Text style={[styles.smallLabel, !active ? styles.inactiveHeading : {}]}>
                    {i18n.t(`map.layerSettings.alertSettings.timeFrame`)}
                  </Text>
                  {active && <Text style={styles.bodyText}>{showingDescription}</Text>}
                </View>
                <Dropdown
                  label={i18n.t(`map.layerSettings.alertSettings.timeFrame`)}
                  description={dropdownDesc}
                  hideLabel
                  selectedValue={{
                    value: timeFrame,
                    id: timeFrame.units + timeFrame.value
                  }}
                  onValueChange={this.onTimeFrameChanged.bind(this, id)}
                  options={this.getFilterThresholdOptions(datasetCategory)}
                  inactive={!active}
                />
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

export default AlertLayerSettings;
