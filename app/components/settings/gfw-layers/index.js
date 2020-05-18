// @flow
import React, { PureComponent } from 'react';
import { Image, TouchableOpacity, Text, TextInput, View, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';

import KeyboardSpacer from 'react-native-keyboard-spacer';

import styles from './styles';
import i18n from 'i18next';
import Row from 'components/common/row';

import { debounce } from 'lodash';

const clearImage = require('assets/clear.png');
const searchImage = require('assets/search.png');

import type { GFWContextualLayer } from 'types/layers.types';

type Props = {
  componentId: string,
  fetchLayers: (page: number, searchTerm: ?string) => void,
  fullyLoaded: boolean,
  loadedPage: ?number,
  isInitialLoad: boolean,
  isPaginating: boolean,
  layers: Array<GFWContextualLayer>,
  totalLayers: ?number
};

type State = {
  scrolled: boolean,
  searchFocussed: boolean,
  searchTerm: ?string
};

type ReactObjRef<ElementType: React.ElementType> = { current: null | React.ElementRef<ElementType> };

class GFWLayers extends PureComponent<Props, State> {
  textInput: ReactObjRef<TextInput>;

  handleSearchDebounced: ?() => void;

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
      scrolled: false,
      searchFocussed: false,
      searchTerm: null
    };
    props.fetchLayers(0);
    Navigation.events().bindComponent(this);

    this.handleSearchDebounced = debounce(function() {
      this.props.fetchLayers(0, this.state.searchTerm);
    }, 400);
  }

  onClearSearch = () => {
    this.setState({
      searchTerm: null
    });
    this.props.fetchLayers(0, null);
    this.textInput?.blur?.();
  };

  onSearchTermChange = text => {
    this.setState({
      searchTerm: text
    });
    this.handleSearchDebounced?.();
  };

  paginate = () => {
    if (this.props.isPaginating || this.props.isInitialLoad || this.props.fullyLoaded) {
      return;
    }
    if (this.props.loadedPage === null) {
      return;
    }
    this.props.fetchLayers(this.props.loadedPage + 1, this.state.searchTerm);
  };

  onScroll = event => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    const scrolled = contentOffset > 12;
    if (scrolled !== this.state.scrolled) {
      this.setState({
        scrolled: scrolled
      });
    }
  };

  renderHeader = () => {
    let headerString: ?string = null;

    if (this.state.searchFocussed) {
      if (this.state.searchTerm) {
        if (this.props.layers.length) {
          headerString = i18n.t('importLayer.gfw.results', {
            count: this.props.layers.length,
            searchTerm: this.state.searchTerm
          });
        } else {
          headerString = i18n.t('importLayer.gfw.noResults', { searchTerm: this.state.searchTerm });
        }
      } else {
        headerString = i18n.t('importLayer.gfw.searchHint');
      }
    } else if (this.props.totalLayers !== null) {
      headerString = i18n.t('importLayer.gfw.allLayers', { count: this.props.totalLayers });
    }

    if (!headerString) {
      return null;
    }
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{headerString}</Text>
      </View>
    );
  };

  renderLayer = ({ item, index }: { item: GFWContextualLayer } ) => {
    return (
      <Row style={styles.row}>
        <Text style={styles.rowLabel}>{item.attributes.name}</Text>
      </Row>
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.topContainer, this.state.scrolled ? styles.topContainerScrolled : {}]}>
          <View style={styles.searchContainer}>
            <TextInput
              autofocus={false}
              autoCapitalize="none"
              autoCorrect={false}
              value={this.state.searchTerm}
              underlineColorAndroid="transparent"
              placeholder={i18n.t('importLayer.gfw.searchPlaceholder')}
              ref={ref => {
                this.textInput = ref;
              }}
              style={styles.searchField}
              onBlur={() => this.setState({ searchFocussed: false })}
              onChangeText={this.onSearchTermChange}
              onFocus={() => this.setState({ searchFocussed: true })}
            />
            {!this.state.searchFocussed && <Image source={searchImage} />}
            {this.state.searchFocussed && this.state.searchTerm && (
              <TouchableOpacity onPress={this.onClearSearch}>
                <Image source={clearImage} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlatList
          style={{ width: '100%' }}
          keyExtractor={(item, index) => index.toString()}
          data={!this.state.searchFocussed || this.state.searchTerm ? this.props.layers : []}
          keyboardShouldPersistTaps="handled"
          renderItem={this.renderLayer}
          ListHeaderComponent={this.renderHeader}
          onEndReached={this.paginate}
          onEndReachedThreshold={0.5}
          onScroll={this.onScroll}
        />
        <KeyboardSpacer />
      </View>
    );
  }
}

export default GFWLayers;
