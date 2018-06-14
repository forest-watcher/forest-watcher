import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text
} from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import tracker from 'helpers/googleAnalytics';

import i18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';

class TermsAndConditions extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  static propTypes = {
    navigator: PropTypes.object.isRequired
  };

  componentDidMount() {
    tracker.trackScreenView('TermsAndConditions');
  }

  render() {
    return (
      <View style={styles.container}>
        <Hyperlink
          style={styles.termsTextLinkContainer}
          linkDefault
          linkStyle={Theme.link}
          linkText={() => i18n.t('termsAndConditions.linkText')}
        >
          <Text style={[styles.termsText, styles.termsTextLink]} selectable>
            {i18n.t('termsAndConditions.agreeText')} https://www.globalforestwatch.org/terms.
          </Text>
        </Hyperlink>
      </View>
    );
  }
}

export default TermsAndConditions;
