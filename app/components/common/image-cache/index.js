import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  Image
} from 'react-native';

import i18n from 'locales';
import CONSTANTS from 'config/constants';
import { getCachedImageByUrl } from 'helpers/fileManagement';
import styles from './styles';

class ImageCache extends Component {
  constructor() {
    super();

    this.state = {
      url: null,
      error: false,
      loading: true,
      noImage: false
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
      let url = null;
      if (this.props.isConnected) {
        url = await getCachedImageByUrl(source.uri, CONSTANTS.files.images.alerts);
      }
      if (url) {
        this.setState({ url });
      } else {
        this.setState({
          loading: false,
          noImage: true
        });
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
            <Text>{i18n.t('commonText.loading')}</Text>
          </View>
          )
        : null
        }
        {!this.state.loading && this.state.noImage
        ? (
          <View style={styles.loader}>
            <Text style={styles.loaderText}>{i18n.t('commonText.noImage')}</Text>
          </View>
          )
        : null
        }
        {this.state.url &&
          <Image
            source={{ uri: this.state.url }}
            style={this.props.style}
            resizeMode={this.props.resizeMode}
            onError={(e) => this.setState({ error: e.nativeEvent.error, loading: false })}
            onLoad={() => this.showImage()}
          />
        }
      </View>
    );
  }
}

ImageCache.propTypes = {
  source: PropTypes.object.isRequired,
  resizeMode: PropTypes.string,
  localSource: PropTypes.bool,
  isConnected: PropTypes.bool,
  style: PropTypes.object
};

ImageCache.defaultProps = {
  resizeMode: 'contain'
};

export default ImageCache;
