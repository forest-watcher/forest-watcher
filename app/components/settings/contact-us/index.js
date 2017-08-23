import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  Text,
  Linking
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import Theme from 'config/theme';
import List from 'components/common/list';
import styles from './styles';

class ContactUs extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  constructor() {
    super();

    this.state = {
      currentPosition: null
    };
  }

  componentDidMount() {
    tracker.trackScreenView('ContactUs');
  }

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.contactUs}>
          <Text style={styles.contactUsText}>{I18n.t('contactUs.description')}</Text>
        </View>
      </ScrollView>
    );
  }
}

ContactUs.propTypes = {};

export default ContactUs;
