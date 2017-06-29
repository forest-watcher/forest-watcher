import React, { Component } from 'react';
import {
  View,
  Text,
  Picker
} from 'react-native';

import I18n from 'locales';
import constants from 'config/constants';
import styles from './styles';

const VIIRS_OPTIONS = [
  {
    label: 'settings.24hAgo',
    value: 1
  },
  {
    label: 'settings.24hAgo',
    value: 1
  },
  {
    label: 'settings.24hAgo',
    value: 1
  },
  {
    label: 'settings.24hAgo',
    value: 1
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

class DropdownPicker extends Component {
  getPickerOptions() {
    const options = this.props.slug === constants.datasets.VIIRS ? VIIRS_OPTIONS : GLAD_OPTIONS;
    return options.map(option => (<Picker.Item label={I18n.t(option.label)} value={option.value} key={option.label} />));
  }
  handleRangeChange(days) {
    this.props.updateRange({ startDate: days });
  }
  render() {
    return (<View style={styles.datesSection}>
      <Text style={styles.dateContainerLabel}>
        {I18n.t('settings.timeFrame')}
      </Text>
      <View style={styles.dateContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={this.props.startDate}
            onValueChange={(days) => this.handleRangeChange(days)}
            itemStyle={{ height: 72 }}
          >
            {this.getPickerOptions()}
          </Picker>
        </View>
      </View>
    </View>);
  }
}

DropdownPicker.propTypes = {
  startDate: React.PropTypes.number.isRequired,
  updateRange: React.PropTypes.func.isRequired,
  slug: React.PropTypes.string.isRequired
};

export default DropdownPicker;
