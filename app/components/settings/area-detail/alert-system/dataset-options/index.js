import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';

import { DATASETS } from 'config/constants/index';
import Dropdown from 'components/common/dropdown';
import styles from './styles';

const VIIRS_OPTIONS = [
  {
    label: 'settings.24hAgo',
    value: 1
  },
  {
    label: 'settings.48hAgo',
    value: 2
  },
  {
    label: 'settings.72hAgo',
    value: 3
  },
  {
    label: 'settings.oneWeekAgo',
    value: 7
  }
];
const GLAD_OPTIONS = [
  {
    label: 'settings.1MonthAgo',
    value: 1
  },
  {
    label: 'settings.3MonthsAgo',
    value: 3
  },
  {
    label: 'settings.6MonthsAgo',
    value: 6
  },
  {
    label: 'settings.1yearAgo',
    value: 12
  }
];

class DatasetOptions extends Component {

  handleUpdateDate = (date) => {
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
            label={'settings.timeFrame'}
            selectedValue={parseInt(startDate, 10)}
            onValueChange={days => this.handleUpdateDate({ startDate: days })}
            options={options}
          />
        </View>
      </View>
    );
  }
}

DatasetOptions.propTypes = {
  id: PropTypes.string,
  dataset: PropTypes.shape({
    slug: PropTypes.string,
    cache: PropTypes.bool,
    startDate: PropTypes.oneOf(
      PropTypes.string,
      PropTypes.number
    )
  }),
  updateDate: PropTypes.func.isRequired
};

export default DatasetOptions;
