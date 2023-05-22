// @flow

import React, { Component } from 'react';
import Hyperlink from 'react-native-hyperlink';
import { View, Text } from 'react-native';
import { trackScreenView } from 'helpers/analytics';

import i18n from 'i18next';
import Theme from 'config/theme';
import styles from './styles';

class ContactUs extends Component<{}> {
  componentDidMount() {
    trackScreenView('ContactUs');
  }

  render() {
    return (
      <View style={styles.container}>
        <Hyperlink
          linkStyle={Theme.link}
          linkText={url => (url === 'mailto:forestwatcher@wri.org' ? 'forestwatcher@wri.org' : url)}
        >
          <Text style={styles.contactUsText} selectable>
            {i18n.t('contactUs.description')}
          </Text>
        </Hyperlink>
      </View>
    );
  }
}

ContactUs.propTypes = {};

export default ContactUs;
