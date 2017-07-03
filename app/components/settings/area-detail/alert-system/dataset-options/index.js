import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';

import DropdownPicker from 'components/settings/area-detail/alert-system/dropdown-picker';

import styles from './styles';

class DatasetOptions extends Component {
  onChange = (currentValue) => {
    const { id, dataset, setAreaDatasetCache } = this.props;
    const updatedValue = !currentValue;
    setAreaDatasetCache(id, dataset.slug, updatedValue);
  }

  handleUpdateDate = (date) => {
    const { id, dataset, updateDate } = this.props;
    updateDate(id, dataset.slug, date);
  }

  render() {
    const { slug, startDate } = this.props.dataset;
    return (
      <View style={styles.datasetSection}>
        <View style={[styles.row, styles.nested]}>
          <DropdownPicker
            updateRange={this.handleUpdateDate}
            startDate={parseInt(startDate, 10)}
            slug={slug}
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
    startDate: PropTypes.number
  }),
  updateDate: PropTypes.func.isRequired,
  setAreaDatasetCache: PropTypes.func.isRequired
};

export default DatasetOptions;
