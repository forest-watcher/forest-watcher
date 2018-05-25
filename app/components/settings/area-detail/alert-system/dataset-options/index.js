// @flow
import type { Dataset } from 'types/areas.types';

import React, { Component } from 'react';
import {
  View
} from 'react-native';
import i18n from 'locales';

import { DATASETS } from 'config/constants/index';
import Dropdown from 'components/common/dropdown';
import styles from './styles';

const VIIRS_OPTIONS = [
  {
    label: i18n.t('settings.24hAgo'),
    value: 1
  },
  {
    label: i18n.t('settings.48hAgo'),
    value: 2
  },
  {
    label: i18n.t('settings.72hAgo'),
    value: 3
  },
  {
    label: i18n.t('settings.oneWeekAgo'),
    value: 7
  }
];
const GLAD_OPTIONS = [
  {
    label: i18n.t('settings.1MonthAgo'),
    value: 1
  },
  {
    label: i18n.t('settings.3MonthsAgo'),
    value: 3
  },
  {
    label: i18n.t('settings.6MonthsAgo'),
    value: 6
  },
  {
    label: i18n.t('settings.1yearAgo'),
    value: 12
  }
];

type Date = { startDate: number };

type Props = {
  id: string,
  dataset: Dataset,
  updateDate: (id: string, slug: string, date: Date) => void
};

class DatasetOptions extends Component<Props> {

  handleUpdateDate = (date: Date) => {
    const { id, dataset, updateDate } = this.props;
    updateDate(id, dataset.slug, date);
  }

  render() {
    const { slug, startDate } = this.props.dataset;
    const options = slug === DATASETS.VIIRS ? VIIRS_OPTIONS : GLAD_OPTIONS;
    return (
      <View style={styles.datasetSection}>
        <View style={[styles.row, styles.nested]}>
          <Dropdown
            label={i18n.t('settings.timeFrame')}
            selectedValue={parseInt(startDate, 10)}
            onValueChange={days => this.handleUpdateDate({ startDate: days })}
            options={options}
          />
        </View>
      </View>
    );
  }
}

export default DatasetOptions;
