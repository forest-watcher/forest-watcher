import React, { Component } from 'react';
import { View, ScrollView, Text, Linking } from 'react-native';
import tracker from 'helpers/googleAnalytics';

import i18n from 'i18next';
import List from 'components/common/list';
import styles from './styles';

const tscLogo = require('assets/3sc_logo.jpeg');
const wriLogo = require('assets/wri_logo.png');
const jgiLogo = require('assets/jgi_logo.png');
const gfwLogo = require('assets/gfw_logo.png');
const vizzualityLogo = require('assets/vizzuality_logo.png');

class Partners extends Component {
  constructor() {
    super();
    this.partners = [
      {
        text: 'Global Forest Watch',
        image: gfwLogo,
        url: 'http://www.globalforestwatch.org/',
        functionOnPress: this.handleLink
      },
      {
        text: 'World Resources Institute',
        image: wriLogo,
        url: 'http://www.wri.org/',
        functionOnPress: this.handleLink
      },
      {
        text: '3 Sided Cube',
        image: tscLogo,
        url: 'https://3sidedcube.com/',
        functionOnPress: this.handleLink
      },
      {
        text: 'Vizzuality',
        image: vizzualityLogo,
        url: 'http://www.vizzuality.com/',
        functionOnPress: this.handleLink
      },
      {
        text: 'The Jane Goodall Institute',
        image: jgiLogo,
        url: 'http://www.janegoodall.org/',
        functionOnPress: this.handleLink
      }
    ];
  }

  componentDidMount() {
    tracker.trackScreenView('Partners');
  }

  handleLink = url => {
    Linking.openURL(url);
  };

  render() {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.partner}>
          <Text style={styles.partnerText}>{i18n.t('partners.description')}</Text>
          <Text
            style={styles.partnerText}
            onPress={() => this.handleLink('http://www.globalforestwatch.org/about/the-gfw-partnership')}
          >
            {i18n.t('partners.listOfPartners')}
          </Text>
        </View>
        <List content={this.partners} bigSeparation={false}>
          {}
        </List>
      </ScrollView>
    );
  }
}

export default Partners;
