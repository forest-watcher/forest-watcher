// @flow
import React, { PureComponent } from 'react';
import { Text, View, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';

import styles from './styles';
import i18n from 'i18next';
import Row from 'components/common/row';

import type { GFWContextualLayer } from 'types/layers.types';

type Props = {
  componentId: string,
  fetchLayers: (page: number) => void,
  fullyLoaded: boolean,
  loadedPage: ?number,
  isInitialLoad: boolean,
  isPaginating: boolean,
  layers: Array<GFWContextualLayer>,
  totalLayers: ?number
};

type State = {
  searchTerm: ?string
};

class GFWLayers extends PureComponent<Props, State> {
  static options(passProps: {}) {
    return {
      topBar: {
        title: {
          text: i18n.t('importGFWLayer.title')
        }
      }
    };
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      searchTerm: null
    };
    props.fetchLayers(0);
    Navigation.events().bindComponent(this);
  }

  paginate = () => {
    if (this.props.isPaginating || this.props.isInitialLoad || this.props.fullyLoaded) {
      return;
    }
    if (this.props.loadedPage === null) {
      return;
    }
    this.props.fetchLayers(this.props.loadedPage + 1);
  };

  renderHeader = () => {
    if (this.props.totalLayers === null) {
      return null;
    }
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{i18n.t('importGFWLayer.allLayers', { count: this.props.totalLayers })}</Text>
      </View>
    );
  };

  renderLayer = ({ item, index }) => {
    return (
      <Row style={styles.row}>
        <Text style={styles.rowLabel}>{item.attributes.name}</Text>
      </Row>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          style={{ width: '100%' }}
          keyExtractor={(item, index) => index.toString()}
          data={this.props.layers}
          renderItem={this.renderLayer}
          ListHeaderComponent={this.renderHeader}
          onEndReached={this.paginate}
          onEndReachedThreshold={0.5}
        />
      </View>
    );
  }
}

export default GFWLayers;
