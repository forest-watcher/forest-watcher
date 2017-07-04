import React, { Component } from 'react';
import PropTypes from 'prop-types';
import List from 'components/common/list';
import AreaList from 'containers/settings/area-list';
import {
  View,
  Text,
  TouchableHighlight,
  ScrollView,
  Image
} from 'react-native';

import Theme from 'config/theme';
import I18n from 'locales';
import tracker from 'helpers/googleAnalytics';

import styles from './styles';

const plusIcon = require('assets/plus.png');

class Settings extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    tracker.trackScreenView('Set Up');
  }

  componentWillReceiveProps(props) {
    if (props.areas.length === 0) {
      props.navigator.push({
        screen: 'ForestWatcher.Setup'
      });
    }
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
    const { areas } = this.props;

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
              <AreaList onAreaPress={(areaId, name) => this.onAreaPress(areaId, name)} />
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
  user: PropTypes.any,
  areas: PropTypes.any,
  navigator: PropTypes.object.isRequired,
  logout: PropTypes.func.isRequired
};

export default Settings;
