import React, { Component } from 'react';
import {
  Text,
  View,
  Image
} from 'react-native';

import I18n from 'locales';
import CONSTANTS from 'config/constants';
import { getCachedImageByUrl } from 'helpers/fileManagement';
import styles from './styles';

class ImageCache extends Component {
  constructor() {
    super();

    this.state = {
      url: null,
      error: false,
      loading: true
    };
  }

  componentDidMount() {
    if (!this.props.localSource) {
      this.getUrl();
    } else {
      this.getLocalSource();
    }
  }

  getLocalSource() {
    this.setState({ url: this.props.source.uri });
  }

  async getUrl() {
    const { source } = this.props;

    if (source.uri) {
      const url = await getCachedImageByUrl(source.uri, CONSTANTS.files.images.alerts);
      if (url) {
        this.setState({ url });
      }
    }
  }

  showImage() {
    this.setState({ error: false, loading: false });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading
        ? (
          <View style={styles.loader}>
            <Text style={styles.loaderText}>{I18n.t('commonText.loading')}</Text>
          </View>
          )
        : null
        }
        {this.state.url &&
          <Image
            resizeMode={this.props.resizeMode || 'contain'}
            source={{ uri: this.state.url }}
            style={[styles.image, this.props.style]}
            onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false })}
            onLoad={() => this.showImage()}
          />
        }
      </View>
    );
  }
}

ImageCache.propTypes = {
  source: React.PropTypes.object.isRequired,
  resizeMode: React.PropTypes.string,
  localSource: React.PropTypes.bool,
  style: React.PropTypes.object
};

export default ImageCache;
