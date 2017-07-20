import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View
} from 'react-native';

import DropdownPicker from 'components/settings/area-detail/alert-system/dropdown-picker';

import styles from './styles';

class DatasetOptions extends Component {

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
    startDate: PropTypes.oneOf(
      React.PropTypes.string,
      React.PropTypes.number
    )
  }),
  updateDate: PropTypes.func.isRequired
};

export default DatasetOptions;
