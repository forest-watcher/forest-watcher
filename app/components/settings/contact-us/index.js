import React, { Component } from 'react';
import {
  View,
  ScrollView,
  Text,
  Linking
} from 'react-native';
import tracker from 'helpers/googleAnalytics';

import I18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';

class ContactUs extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

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
          <Text
            style={styles.contactUsText}
            onPress={() => Linking.openURL('mailto:forestwatcher@wri.or?subject=FW app contact')}
          >
            {I18n.t('contactUs.description')}
          </Text>
        </View>
      </ScrollView>
    );
  }
}

ContactUs.propTypes = {};

export default ContactUs;
