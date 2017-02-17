import React, { Component } from 'react';
import {
  Text,
  View,
  Animated,
  Easing
} from 'react-native';

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
    this.getUrl();
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
            <Text style={styles.loaderText}>Loading</Text>
          </Animated.View>
          )
        : null
        }
        {this.state.url &&
          <Animated.Image
            source={{ uri: this.state.url }}
            style={[styles.image, this.props.style, { opacity: this.state.opacity }]}
            onLoadStart={() => this.setState({ loading: true })}
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
  style: React.PropTypes.object
};

export default ImageCache;
