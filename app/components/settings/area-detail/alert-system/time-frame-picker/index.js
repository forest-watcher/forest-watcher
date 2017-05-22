import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import moment from 'moment';

import DatePicker from 'react-native-datepicker';
import I18n from 'locales';
import styles from './styles';

const dateFormat = 'YYYYMMDD';
const dateFormatDisplay = 'MMM Do YYYY';
const START_DATE = 'Jan 1st 2015';

class TimeFramePicker extends Component {
  onDateChange = date => this.props.updateDate(date)
  render() {
    return (<View style={styles.datesSection}>
      <Text style={styles.dateContainerLabel}>
        {I18n.t('settings.timeFrame')}
      </Text>
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>
          {I18n.t('settings.from')}
        </Text>
        <DatePicker
          showIcon={false}
          date={moment(this.props.fromDate, dateFormat).format(dateFormatDisplay)}
          mode="date"
          format={dateFormatDisplay}
          minDate={START_DATE}
          // if set to null DatePicker will try to parse it as a date and crash, undefined prevents this
          maxDate={moment(this.props.toDate, dateFormat).format(dateFormatDisplay) || undefined}
          placeholder={I18n.t('report.datePlaceholder')}
          cancelBtnText={I18n.t('commonText.cancel')}
          confirmBtnText={I18n.t('commonText.confirm')}
          onDateChange={date => this.onDateChange({ fromDate: moment(date, dateFormatDisplay).format(dateFormat) })}
          customStyles={{
            dateInput: styles.dateInput,
            dateText: styles.dateText
          }}
        />
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateLabel}>
          {I18n.t('settings.to')}
        </Text>
        <DatePicker
          style={styles.datePicker}
          showIcon={false}
          date={moment(this.props.toDate, dateFormat).format(dateFormatDisplay)}
          mode="date"
          format={dateFormatDisplay}
          minDate={moment(this.props.fromDate, dateFormat).format(dateFormatDisplay) || START_DATE}
          placeholder={I18n.t('report.datePlaceholder')}
          cancelBtnText={I18n.t('commonText.cancel')}
          confirmBtnText={I18n.t('commonText.confirm')}
          onDateChange={date => this.onDateChange({ toDate: moment(date, dateFormatDisplay).format(dateFormat) })}
          customStyles={{
            dateInput: styles.dateInput,
            dateText: styles.dateText
          }}
        />
      </View>
    </View>);
  }
}

TimeFramePicker.propTypes = {
  fromDate: React.PropTypes.string,
  toDate: React.PropTypes.string,
  updateDate: React.PropTypes.func
};

export default TimeFramePicker;
