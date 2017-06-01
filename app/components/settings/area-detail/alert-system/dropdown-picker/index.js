import React, { Component } from 'react';
import {
  View,
  Text,
  Picker
} from 'react-native';

import I18n from 'locales';
import styles from './styles';

class DropdownPicker extends Component {
  handleRangeChange(days) {
    this.props.updateViirsRange({ startDate: days, endDate: '1' });
  }
  render() {
    return (<View style={styles.datesSection}>
      <Text style={styles.dateContainerLabel}>
        {I18n.t('settings.timeFrame')}
      </Text>
      <View style={styles.dateContainer}>
        <Picker
          selectedValue={this.props.startDate}
          onValueChange={(days) => this.handleRangeChange(days)}
        >
          <Picker.Item label={I18n.t('settings.24hAgo')} value={'1'} />
          <Picker.Item label={I18n.t('settings.48hAgo')} value={'2'} />
          <Picker.Item label={I18n.t('settings.72hAgo')} value={'3'} />
          <Picker.Item label={I18n.t('settings.oneWeekAgo')} value={'7'} />
        </Picker>
      </View>
    </View>);
  }
}

DropdownPicker.propTypes = {
  startDate: React.PropTypes.string,
  updateViirsRange: React.PropTypes.func
};

export default DropdownPicker;
