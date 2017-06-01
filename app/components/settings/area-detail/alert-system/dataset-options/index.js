import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import TimeFramePicker from 'components/settings/area-detail/alert-system/time-frame-picker';
import DropdownPicker from 'components/settings/area-detail/alert-system/dropdown-picker';
import CustomSwitch from 'components/common/switch';

import styles from './styles';

class DatasetOptions extends Component {
  onChange = (value) => {
    const { id, dataset, cacheArea, removeCachedArea } = this.props;
    if (value) {
      cacheArea(id, dataset.slug);
    } else {
      removeCachedArea(id, dataset.slug);
    }
  }

  handleUpdateDate = (date) => {
    const { id, dataset, updateDate } = this.props;
    updateDate(id, dataset.slug, date);
  }

  render() {
    const { slug, cache, startDate, endDate } = this.props.dataset;
    return (
      <View style={styles.datasetSection}>
        <View style={styles.datasetSection}>
          <View style={[styles.row, styles.nested]}>
            <Text style={styles.title}>{'cache'}</Text>
            <CustomSwitch value={cache} onValueChange={this.onChange} />
          </View>
        </View>
        <View style={[styles.row, styles.nested]}>
          {(slug !== 'viirs') ?
            <TimeFramePicker
              startDate={startDate}
              endDate={endDate}
              updateDate={this.handleUpdateDate}
            /> :
            <DropdownPicker
              updateViirsRange={this.handleUpdateDate}
              startDate={startDate}
            />
          }
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
    startDate: React.PropTypes.string,
    endDate: React.PropTypes.string
  }),
  cacheArea: React.PropTypes.func,
  removeCachedArea: React.PropTypes.func,
  updateDate: React.PropTypes.func
};

export default DatasetOptions;
