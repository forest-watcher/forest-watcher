import React, { Component } from 'react';
import { Image, Text, View } from 'react-native';

import i18n from 'locales';
import styles from './styles';

const noGPSIcon = require('assets/gpsOff.png');

export default class NoGPSBanner extends Component {
  render() {
    return (
      <View style={styles.noGPSBanner}>
        <View style={styles.noGPSContainer}>
          <Image style={styles.noGPSImage} source={noGPSIcon} />
          <View style={styles.noGPSTextContainer}>
            <Text style={styles.noGPSText}>{i18n.t('alerts.noGPS')}</Text>
          </View>
        </View>
      </View>
    );
  }
}
