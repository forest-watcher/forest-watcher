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

const wriLogo = require('assets/wri_logo.png');
const jgiLogo = require('assets/jgi_logo.png');
const gfwLogo = require('assets/gfw_logo.png');
const vizzualityLogo = require('assets/vizzuality_logo.png');

class Partners extends Component {
  static navigatorStyle = {
    navBarTextColor: Theme.colors.color1,
    navBarButtonColor: Theme.colors.color1,
    topBarElevationShadowEnabled: false,
    navBarBackgroundColor: Theme.background.main
  };

  componentDidMount() {
    tracker.trackScreenView('Partners');
  }

  handleLink = (url) => {
    Linking.openURL(url);
  }

  render() {
    const partners = [
      {
        description: 'Global Forest Watch',
        image: gfwLogo,
        url: 'http://www.globalforestwatch.org/',
        functionOnPress: this.handleLink
      },
      {
        description: 'World Resources Institute',
        image: wriLogo,
        url: 'http://www.wri.org/',
        functionOnPress: this.handleLink
      },
      {
        description: 'Vizzuality',
        image: vizzualityLogo,
        url: 'http://www.vizzuality.com/',
        functionOnPress: this.handleLink
      },
      {
        description: 'The Jane Goodall Institute',
        image: jgiLogo,
        url: 'http://www.janegoodall.org/',
        functionOnPress: this.handleLink
      }
    ];
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.partner}>
          <Text style={styles.partnerText}>{I18n.t('partners.description')}</Text>
          <Text
            style={styles.partnerText}
            onPress={() => this.handleLink('http://www.globalforestwatch.org/about/the-gfw-partnership')}
          >
            {I18n.t('partners.listOfPartners')}
          </Text>
        </View>
        <List content={partners} bigSeparation={false}>{}</List>
      </ScrollView>
    );
  }
}

Partners.propTypes = {
  partners: PropTypes.array
};

export default Partners;
