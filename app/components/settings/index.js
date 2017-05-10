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
import LeftBtn from 'components/common/header/left-btn';
import Theme from 'config/theme';
import I18n from 'locales';
import headerStyles from 'components/common/header/styles';
import tracker from 'helpers/googleAnalytics';

import styles from './styles';

const plusIcon = require('assets/plus.png');

class Settings extends Component {
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

  onAreaPress = (areaId) => {
    this.props.navigate('AreaDetail', { id: areaId });
  }

  onLogoutPress = () => {
    this.props.logout();
    this.props.navigate('Home');
  }

  onDateChange = date => this.props.updateDate(date)

  handlePartnersLink = () => {
    this.props.navigate('Partners');
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
            onPress={() => navigate('Setup')}
          >
            <View style={styles.addButton}>
              <Image style={Theme.icon} source={plusIcon} />
              <Text style={styles.addButtonText}>
                {I18n.t('settings.addArea').toUpperCase()}
              </Text>
            </View>
          </TouchableHighlight>

          <View style={styles.datesSection}>
            <Text style={styles.dateContainerLabel}>
              Time Frame
            </Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>
                From
              </Text>
              <DatePicker
                showIcon={false}
                date={this.props.fromDate}
                mode="date"
                format="MMM Do YYYY"
                minDate="2010-01-01"
                // if set to null DatePicker will try to parse it as a date and crash, undefined prevents this
                maxDate={this.state.toDate || undefined}
                placeholder={I18n.t('report.datePlaceholder')}
                cancelBtnText={I18n.t('commonText.cancel')}
                confirmBtnText={I18n.t('commonText.confirm')}
                onDateChange={date => this.onDateChange({ fromDate: date })}
                customStyles={{
                  dateInput: styles.dateInput,
                  dateText: styles.dateText
                }}
              />
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>
                To
              </Text>
              <DatePicker
                style={styles.datePicker}
                showIcon={false}
                date={this.props.toDate}
                mode="date"
                format="MMM Do YYYY"
                minDate={this.state.fromDate || '2010-01-01'}
                placeholder={I18n.t('report.datePlaceholder')}
                cancelBtnText={I18n.t('commonText.cancel')}
                confirmBtnText={I18n.t('commonText.confirm')}
                onDateChange={date => this.onDateChange({ toDate: date })}
                customStyles={{
                  dateInput: styles.dateInput,
                  dateText: styles.dateText
                }}
              />
            </View>
          </View>

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
  navigate: React.PropTypes.func.isRequired,
  getAreas: React.PropTypes.func.isRequired,
  logout: React.PropTypes.func.isRequired,
  updateDate: React.PropTypes.func.isRequired
};

Settings.navigationOptions = {
  header: ({ goBack }) => ({
    left: <LeftBtn goBack={goBack} />,
    tintColor: Theme.colors.color1,
    style: headerStyles.style,
    titleStyle: headerStyles.titleStyle,
    title: I18n.t('settings.title')
  })
};


export default Settings;
