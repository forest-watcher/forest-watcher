import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Picker
} from 'react-native';

import I18n from 'locales';
import styles from './styles';

class CoordinatesDropdown extends Component {
  static propTypes = {
    coordinateFormat: PropTypes.string.isRequired,
    setCoordinatesFormat: PropTypes.func.isRequired
  };
  getPickerOptions() {
    return options.map(option => (<Picker.Item label={I18n.t(option.label)} value={option.value} key={option.label} />));
  }
  handleRangeChange(format) {
    this.props.setCoordinatesFormat(format);
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
            itemStyle={{ height: 72 }} // Only for iOS platform
          >
            {this.getPickerOptions()}
          </Picker>
        </View>
      </View>
    </View>);
  }
}

export default CoordinatesDropdown;
