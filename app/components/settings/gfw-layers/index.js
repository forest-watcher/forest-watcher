// @flow
import React, { PureComponent } from 'react';
import { Text, ScrollView, View, Image } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import i18n from 'i18next';
import type { File } from 'types/file.types';
import Row from 'components/common/row';
import Theme from 'config/theme';
import debounceUI from 'helpers/debounceUI';
import DocumentPicker from 'react-native-document-picker';
import generatedUniqueId from 'helpers/uniqueId';
const nextIcon = require('assets/next.png');
const fileIcon = require('assets/fileIcon.png');

export const ACCEPTED_FILE_TYPES = ['json', 'geojson', 'topojson', 'gpx', 'zip', 'kmz', 'kml'];

type Props = {
  componentId: string,
  fetchLayers: (page: number) => void
};

class GFWLayers extends PureComponent<Props> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('importLayer.gfw.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    props.fetchLayers(0);
    Navigation.events().bindComponent(this);
  }

  render() {
    const gfwLayerAction = {
      icon: nextIcon,
      callback: () => {}
    };
    const customContextualLayerAction = {
      icon: null,
      callback: this.importCustomContextualLayer
    };
    return (
      <View style={styles.container}>
        <ScrollView scrollEnabled={false} style={styles.contentContainer}>
          
        </ScrollView>
      </View>
    );
  }
}

export default GFWLayers;
