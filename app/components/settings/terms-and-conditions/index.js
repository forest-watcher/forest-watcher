// @flow

import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Hyperlink from 'react-native-hyperlink';
import tracker from 'helpers/googleAnalytics';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';

class TermsAndConditions extends Component {
  static options(passProps: {}) {
    return {
      topBar: {
        background: {
          color: Theme.colors.veryLightPink
        }
      }
    };
  }
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
