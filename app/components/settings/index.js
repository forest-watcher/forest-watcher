import React, { Component } from 'react';
import List from 'components/common/list';
import AreaList from 'containers/settings/area-list';
import {
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  Image
} from 'react-native';

import DatePicker from 'react-native-datepicker';
import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';
import moment from 'moment';

import styles from './styles';

const plusIcon = require('assets/plus.png');

const dateFormat = 'YYYYMMDD';
const dateFormatDisplay = 'MMM Do YYYY';
const START_DATE = 'Jan 1st 2015';
class Settings extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    // cache disabled for now
    // if (!this.props.areas || !this.props.areas.length > 0) {
    tracker.trackScreenView('Set Up');
    this.props.getAreas();
    // }
  }

  onAreaPress = (areaId, name) => {
    this.props.navigator.push({
      screen: 'ForestWatcher.AreaDetail',
      title: name,
      passProps: {
        id: areaId
      }
    });
  }

  onLogoutPress = () => {
    this.props.logout();
    this.props.navigator.resetTo({
      screen: 'ForestWatcher.Home'
    });
  }

  onPressAddArea = () => {
    this.props.navigator.push({
      screen: 'ForestWatcher.Setup'
    });
  }

  onDateChange = date => this.props.updateDate(date)

  handlePartnersLink = () => {
    this.props.navigator.push({
      screen: 'ForestWatcher.Partners',
      title: 'Partners'
    });
  }

  render() {
    const aboutSections = [
      {
        text: I18n.t('settings.aboutPartners'),
        image: null,
        functionOnPress: this.handlePartnersLink
      },
      {
        text: I18n.t('settings.aboutTerms'),
        image: null,
        functionOnPress: null
      }
    ];
    const { areas, navigate } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Text style={styles.label}>
            {I18n.t('settings.loggedIn')}
          </Text>

          <View style={styles.user}>
            <View style={styles.info}>
              <Text style={styles.name}>
                {this.props.user.fullName}
              </Text>
              <Text style={styles.email} numberOfLines={1} ellipsizeMode="tail" >
                {this.props.user.email}
              </Text>
            </View>
            <TouchableHighlight
              activeOpacity={0.5}
              underlayColor="transparent"
              onPress={this.onLogoutPress}
            >
              <Text style={styles.logout}>{I18n.t('settings.logOut')}</Text>
            </TouchableHighlight>
          </View>

          <View style={styles.datesSection}>
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
          </View>

          {areas && areas.length
            ? <View style={styles.areas}>
              <Text style={styles.label}>
                {I18n.t('settings.yourAreas')}
              </Text>
              <AreaList onAreaPress={(areaId) => this.onAreaPress(areaId)} />
            </View>
          : null
          }
          <TouchableHighlight
            activeOpacity={0.5}
            underlayColor="transparent"
            onPress={() => this.props.navigator.push({
              screen: 'ForestWatcher.Setup' }
            )}
          >
            <View style={styles.addButton}>
              <Image style={Theme.icon} source={plusIcon} />
              <Text style={styles.addButtonText}>
                {I18n.t('settings.addArea').toUpperCase()}
              </Text>
            </View>
          </TouchableHighlight>

          <View style={styles.aboutSection}>
            <Text style={styles.label}>
              {I18n.t('settings.aboutApp')}
            </Text>

            <List content={aboutSections} bigSeparation={false}>{}</List>

            <Text style={[styles.label, styles.footerText]}>
              {I18n.t('commonText.appName')}
            </Text>

          </View>
        </ScrollView>
      </View>
    );
  }
}

Settings.propTypes = {
  user: React.PropTypes.any,
  areas: React.PropTypes.any,
  fromDate: React.PropTypes.string,
  toDate: React.PropTypes.string,
  navigator: React.PropTypes.object.isRequired,
  getAreas: React.PropTypes.func.isRequired,
  logout: React.PropTypes.func.isRequired,
  updateDate: React.PropTypes.func.isRequired,
  navigate: React.PropTypes.func
};

export default Settings;
