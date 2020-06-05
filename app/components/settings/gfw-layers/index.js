// @flow
import React, { PureComponent } from 'react';
import {
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  View,
  FlatList,
  Platform
} from 'react-native';
import { Navigation } from 'react-native-navigation';

import ProgressBar from 'react-native-progress/Bar';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import styles from './styles';
import i18n from 'i18next';
import Row from 'components/common/row';

import Theme from 'config/theme';
import { GFW_CONTEXTUAL_LAYERS } from 'config/constants';

const clearImage = require('assets/clear.png');
const searchImage = require('assets/search.png');

import type { ContextualLayer } from 'types/layers.types';

type Props = {
  componentId: string,
  layers: Array<ContextualLayer>
};

type State = {};

class GFWLayers extends PureComponent<Props, State> {
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
    Navigation.events().bindComponent(this);
  }

  renderHeader = () => {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {i18n.t('importLayer.gfw.allLayers', { count: GFW_CONTEXTUAL_LAYERS.length })}
        </Text>
      </View>
    );
  };

  renderLayer = ({ item }: { item: GFWContextualLayer }) => {
    return (
      <Row style={styles.row}>
        <Text style={styles.rowLabel}>{item.name}</Text>
      </Row>
    );
  };

  render() {
    const localisedSortedLayers = GFW_CONTEXTUAL_LAYERS.map(layer => {
      return {
        ...layer,
        name: i18n.t(`layers.${layer.name}`)
      };
    }).sort((layerA, layerB) => {
      const nameA = layerA.name.toUpperCase();
      const nameB = layerB.name.toUpperCase();
      return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
    });
    return (
      <View style={styles.container}>
        <FlatList
          style={{ width: '100%' }}
          keyExtractor={item => item.id}
          data={localisedSortedLayers}
          renderItem={this.renderLayer}
          ListHeaderComponent={this.renderHeader}
        />
      </View>
    );
  }
}

export default GFWLayers;
