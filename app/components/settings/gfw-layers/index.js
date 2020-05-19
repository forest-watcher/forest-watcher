// @flow
import React, { PureComponent } from 'react';
import { Image, TouchableOpacity, Text, TextInput, View, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';

import ProgressBar from 'react-native-progress/Bar';
import KeyboardSpacer from 'react-native-keyboard-spacer';

import styles from './styles';
import i18n from 'i18next';
import Row from 'components/common/row';

import Theme from 'config/theme';

import { debounce } from 'lodash';

const clearImage = require('assets/clear.png');
const searchImage = require('assets/search.png');

import type { GFWContextualLayer } from 'types/layers.types';

type Props = {
  componentId: string,
  error: ?{
    type: string,
    response: *
  },
  fetchLayers: (page: number, searchTerm: ?string) => Promise<*>,
  fullyLoaded: boolean,
  loadedPage: ?number,
  isInitialLoad: boolean,
  isPaginating: boolean,
  layers: Array<GFWContextualLayer>,
  totalLayers: ?number
};

type State = {
  hasLoaded: boolean,
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
      searchTerm: null,
      hasLoaded: false
    };
    this.fetchLayers(0);
    Navigation.events().bindComponent(this);

    this.handleSearchDebounced = debounce(function() {
      this.props.fetchLayers(0, this.state.searchTerm);
    }, 400);
  }

  fetchLayers = async function(page: number, searchTerm: ?string) {
    await this.props.fetchLayers(page, searchTerm);
    this.setState({ hasLoaded: true });
  };

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

    if (this.props.error) {
      headerString = i18n.t('importLayer.gfw.error');
    }

    if (!headerString) {
      return null;
    }
    return (
      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, this.props.error ? styles.errorTitle : {}]}>{headerString}</Text>
      </View>
    );
  };

  renderLayer = ({ item, index }: { item: GFWContextualLayer }) => {
    return (
      <Row style={styles.row}>
        <Text style={styles.rowLabel}>{item.attributes.name}</Text>
      </Row>
    );
  };

  render() {
    const loadingForTheFirstTime = this.props.isInitialLoad && !this.state.hasLoaded;
    return (
      <View style={styles.container}>
        <View style={[styles.topContainer, this.state.scrolled ? styles.topContainerScrolled : {}]}>
          <View style={styles.searchContainer}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              value={this.state.searchTerm}
              underlineColorAndroid="transparent"
              placeholder={i18n.t('importLayer.gfw.searchPlaceholder')}
              ref={ref => {
                this.textInput = ref;
              }}
              style={[styles.searchField, loadingForTheFirstTime ? { opacity: 0 } : {}]}
              onBlur={() => this.setState({ searchFocussed: false })}
              onChangeText={this.onSearchTermChange}
              onFocus={() => this.setState({ searchFocussed: true })}
            />
            {!this.state.searchFocussed && !loadingForTheFirstTime && <Image source={searchImage} />}
            {this.state.searchFocussed && !!this.state.searchTerm && (
              <TouchableOpacity onPress={this.onClearSearch}>
                <Image source={clearImage} />
              </TouchableOpacity>
            )}
            {this.props.isInitialLoad && (
              <ProgressBar
                indeterminate={true}
                width={Theme.screen.width}
                height={4}
                color={Theme.colors.turtleGreen}
                borderRadius={0}
                borderColor="transparent"
                style={styles.loadingIndicator}
              />
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
