// @flow
import React, { PureComponent } from 'react';
import { View, FlatList, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import i18n from 'i18next';
import Row from 'components/common/row';

import { GFW_CONTEXTUAL_LAYERS } from 'config/constants';

import type { ContextualLayer } from 'types/layers.types';

import debounceUI from 'helpers/debounceUI';
const nextIcon = require('assets/next.png');

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

  onPressLayer = debounceUI((layer: ContextualLayer) => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForestWatcher.GFWLayerDownload',
        passProps: {
          layer
        }
      }
    });
  });

  renderHeader = () => {
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {i18n.t('importLayer.gfw.allLayers', { count: GFW_CONTEXTUAL_LAYERS.length })}
        </Text>
      </View>
    );
  };

  renderLayer = ({ item }: { item: ContextualLayer }) => {
    return (
      <Row
        action={{
          callback: this.onPressLayer.bind(this, item),
          icon: nextIcon
        }}
        style={styles.row}
      >
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
