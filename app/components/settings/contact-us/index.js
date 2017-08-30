import React, { Component } from 'react';
import Hyperlink from 'react-native-hyperlink';
import {
  View,
  ScrollView,
  Text
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
          <Hyperlink
            linkDefault linkStyle={{ color: '#97be32' }}
            linkText={(url) => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
          >
            <Text style={styles.contactUsText} >
              {I18n.t('contactUs.description')}
            </Text>
          </Hyperlink>
        </View>
      </ScrollView>
    );
  }
}

ContactUs.propTypes = {};

export default ContactUs;
