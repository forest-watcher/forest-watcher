// @flow
import React, { PureComponent } from 'react';
import { Text, ScrollView, View, FlatList } from 'react-native';
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

import type { GFWContextualLayer } from 'types/layers.types';

export const ACCEPTED_FILE_TYPES = ['json', 'geojson', 'topojson', 'gpx', 'zip', 'kmz', 'kml'];

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
}

class GFWLayers extends PureComponent<Props, SearchTerm> {
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
    this.state = {
      searchTerm: null
    }
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
  }

  renderHeader = () => {
    if (this.props.totalLayers === null) {
      return null;
    }
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{i18n.t('importLayer.gfw.allLayers', {count: this.props.totalLayers})}</Text>
      </View>
    );
  }

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
