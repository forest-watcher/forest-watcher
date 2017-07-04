import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Picker
} from 'react-native';

import I18n from 'locales';
import styles from './styles';

class DropdownPicker extends Component {
  handleRangeChange(days) {
    this.props.updateRange({ startDate: days });
  }
  render() {
    return (<View style={styles.datesSection}>
      <Text style={styles.dateContainerLabel}>
        {I18n.t('settings.timeFrame')}
      </Text>
      <View style={styles.dateContainer}>
        { this.props.slug === 'viirs' ?
          <Picker
            selectedValue={this.props.startDate}
            onValueChange={(days) => this.handleRangeChange(days)}
          >
            <Picker.Item label={I18n.t('settings.24hAgo')} value={1} />
            <Picker.Item label={I18n.t('settings.48hAgo')} value={2} />
            <Picker.Item label={I18n.t('settings.72hAgo')} value={3} />
            <Picker.Item label={I18n.t('settings.oneWeekAgo')} value={7} />
          </Picker>
          :
          <Picker
            selectedValue={this.props.startDate}
            onValueChange={(days) => this.handleRangeChange(days)}
          >
            <Picker.Item label={I18n.t('settings.1MonthAgo')} value={1} />
            <Picker.Item label={I18n.t('settings.3MonthsAgo')} value={3} />
            <Picker.Item label={I18n.t('settings.6MonthsAgo')} value={6} />
            <Picker.Item label={I18n.t('settings.1yearAgo')} value={12} />
          </Picker>
        }
      </View>
    </View>);
  }
}

DropdownPicker.propTypes = {
  startDate: PropTypes.number.isRequired,
  updateRange: PropTypes.func.isRequired,
  slug: PropTypes.string.isRequired
};

export default DropdownPicker;
