import React, { Component } from 'react';
import {
  Text,
  View,
  Animated,
  Easing
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
      loading: true,
      opacity: new Animated.Value(0),
      opacityLoader: new Animated.Value(1)
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

  hideLoader() {
    Animated.timing(
      this.state.opacityLoader,
      {
        toValue: 0,
        easing: Easing.linear,
        duration: 200
      }
    ).start();
  }

  showImage() {
    this.setState({ error: false }, () => {
      this.animateOpacity();
      this.hideLoader();
    });
  }

  animateOpacity() {
    Animated.timing(
      this.state.opacity,
      {
        toValue: 1,
        easing: Easing.linear,
        duration: 500
      }
    ).start(() => {
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.loading
        ? (
          <Animated.View style={[styles.loader, { opacity: this.state.opacityLoader }]}>
            <Text style={styles.loaderText}>{I18n.t('commonText.loading')}</Text>
          </Animated.View>
          )
        : null
        }
        {this.state.url &&
          <Animated.Image
            resizeMode={this.props.resizeMode || 'contain'}
            source={{ uri: this.state.url }}
            style={[styles.image, this.props.style, { opacity: this.state.opacity }]}
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
