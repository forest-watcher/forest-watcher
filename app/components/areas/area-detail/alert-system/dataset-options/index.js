// @flow
import type { Dataset } from 'types/areas.types';

import React, { Component } from 'react';
import { View } from 'react-native';
import i18n from 'locales';

import { DATASETS, ALERTS_LEGEND } from 'config/constants/index';
import Alertlegend from 'components/common/alert-legend';
import Dropdown from 'components/common/dropdown';
import styles from './styles';

const VIIRS_OPTIONS = [
  {
    label: i18n.t('settings.24hAgo'),
    value: '1'
  },
  {
    label: i18n.t('settings.48hAgo'),
    value: '2'
  },
  {
    label: i18n.t('settings.72hAgo'),
    value: '3'
  },
  {
    label: i18n.t('settings.oneWeekAgo'),
    value: '7'
  }
];
const GLAD_OPTIONS = [
  {
    label: i18n.t('settings.1MonthAgo'),
    value: '1'
  },
  {
    label: i18n.t('settings.3MonthsAgo'),
    value: '3'
  },
  {
    label: i18n.t('settings.6MonthsAgo'),
    value: '6'
  },
  {
    label: i18n.t('settings.1yearAgo'),
    value: '12'
  }
];

type Date = { startDate: number };

type Props = {
  id: string,
  dataset: Dataset,
  showLegend: boolean,
  updateDate: (id: string, slug: string, date: Date) => void
};

class DatasetOptions extends Component<Props> {
  handleUpdateDate = (date: Date) => {
    const { id, dataset, updateDate } = this.props;
    if (dataset.startDate !== date.startDate) {
      updateDate(id, dataset.slug, date);
    }
  };

  render() {
    const { dataset, showLegend } = this.props;
    const { slug, startDate } = dataset;
    const legend = showLegend && [...ALERTS_LEGEND[slug], ...ALERTS_LEGEND.common];
    const options = slug === DATASETS.VIIRS ? VIIRS_OPTIONS : GLAD_OPTIONS;
    return (
      <View style={styles.datasetSection}>
        <View style={[styles.row, styles.nested]}>
          <Dropdown
            label={i18n.t('settings.timeFrame')}
            selectedValue={startDate}
            onValueChange={days => this.handleUpdateDate({ startDate: days })}
            options={options}
          />
          {legend && (
            <View style={[styles.legendContainer, styles.nested]}>
              {legend.map(l => (
                <Alertlegend label={l.label} color={l.color} key={l.color} style={styles.legendItem} />
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }
}

export default DatasetOptions;
