import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import TimeFramePicker from 'components/settings/area-detail/alert-system/time-frame-picker';
import CustomSwitch from 'components/common/switch';

import styles from './styles';

class DatasetOptions extends Component {

  handleUpdateDate = (date) => {
    const { id, dataset, updateDate } = this.props;
    updateDate(id, dataset, date);
  }

  render() {
    const { id, dataset, cacheArea, removeCachedArea } = this.props;
    return (
      <View style={styles.datasetSection}>
        {dataset.value && dataset.options !== undefined && dataset.options.length > 0 &&
          dataset.options.map((option, j) => {
            switch (option.name) {
              case 'cache': {
                const onChange = (value) => {
                  if (value) {
                    cacheArea(id, dataset.slug);
                  } else {
                    removeCachedArea(id, dataset.slug);
                  }
                };
                return (
                  <View key={j} style={[styles.row, styles.nested]}>
                    <Text style={styles.title}>{option.name}</Text>
                    <CustomSwitch value={option.value} onValueChange={onChange} />
                  </View>
                );
              }
              case 'timeframe': {
                return (
                  <View key={j} style={[styles.row, styles.nested]}>
                    <TimeFramePicker
                      fromDate={option.value.fromDate}
                      toDate={option.value.toDate}
                      updateDate={this.handleUpdateDate}
                    />
                  </View>
                );
              }
              default:
                return null;
            }
          })
        }
      </View>
    );
  }
}

DatasetOptions.propTypes = {
  id: React.PropTypes.string,
  dataset: React.PropTypes.object,
  cacheArea: React.PropTypes.func,
  removeCachedArea: React.PropTypes.func,
  updateDate: React.PropTypes.func
};

export default DatasetOptions;
