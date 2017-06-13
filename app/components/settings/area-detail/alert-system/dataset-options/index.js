import React, { Component } from 'react';
import {
  View
} from 'react-native';

import I18n from 'locales';
import DropdownPicker from 'components/settings/area-detail/alert-system/dropdown-picker';
import CheckBtn from 'components/common/form-inputs/check-btn';

import styles from './styles';

class DatasetOptions extends Component {
  onChange = (value) => {
    const { id, dataset, cacheArea, removeCachedArea } = this.props;
    if (value) {
      removeCachedArea(id, dataset.slug);
    } else {
      cacheArea(id, dataset.slug);
    }
  }

  handleUpdateDate = (date) => {
    const { id, dataset, updateDate } = this.props;
    updateDate(id, dataset.slug, date);
  }

  render() {
    const { slug, cache, startDate } = this.props.dataset;
    return (
      <View style={styles.datasetSection}>
        <View style={styles.datasetSection}>
          <View style={[styles.row, styles.nested]}>
            <CheckBtn
              value={I18n.t('settings.availableOffline')}
              checked={cache}
              onPress={() => this.onChange(cache)}
            />
          </View>
        </View>
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
  id: React.PropTypes.string,
  dataset: React.PropTypes.shape({
    slug: React.PropTypes.string,
    cache: React.PropTypes.bool,
    startDate: React.PropTypes.string
  }),
  cacheArea: React.PropTypes.func,
  removeCachedArea: React.PropTypes.func,
  updateDate: React.PropTypes.func
};

export default DatasetOptions;
