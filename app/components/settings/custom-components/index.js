// @flow
import React, { Component } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import Row from 'components/common/row';
import { formatBytes } from 'helpers/data';
import debounceUI from 'helpers/debounceUI';

import i18n from 'i18next';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

const baseMapsIcon = require('assets/basemap.png');
const layersIcon = require('assets/contextualLayers.png');
const nextIcon = require('assets/next.png');

type Props = {
  componentId: string
};

export default class CustomComponents extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        title: {
          text: i18n.t('settings.customComponents.title')
        }
      }
    };
  }

  basemapsAction: { callback: () => void, icon: any };

  contextualLayersAction: { callback: () => void, icon: any };

  constructor() {
    super();

    this.basemapsAction = {
      callback: this.onPressBasemaps,
      icon: nextIcon
    };

    this.contextualLayersAction = {
      callback: this.onPressContextualLayers,
      icon: nextIcon
    };
  }

  onPressBasemaps = () => {};

  onPressContextualLayers = () => {};

  componentDidMount() {
    tracker.trackScreenView('Custom Components');
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <Row action={this.basemapsAction} rowStyle={styles.row} style={styles.rowContainer}>
            <Image style={styles.rowIcon} source={baseMapsIcon}/>
            <View>
              <Text style={styles.rowLabel}>{i18n.t('settings.customComponents.baseMaps')}</Text>
              <Text style={styles.rowSublabel}>{formatBytes(5162124)}</Text>
            </View>
          </Row>
          <Row action={this.contextualLayersAction} rowStyle={styles.row} style={styles.rowContainer}>
            <Image style={styles.rowIcon} source={layersIcon}/>
            <View>
              <Text style={styles.rowLabel}>{i18n.t('settings.customComponents.contextualLayers')}</Text>
              <Text style={styles.rowSublabel}>{formatBytes(2316122)}</Text>
            </View>
          </Row>
        </ScrollView>
      </View>
    );
  }
}
