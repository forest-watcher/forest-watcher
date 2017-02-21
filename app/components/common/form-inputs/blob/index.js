import React, { Component } from 'react';
import {
  View,
  Image,
  TouchableHighlight
} from 'react-native';
import Camera from 'react-native-camera';

import Theme from 'config/theme';
import styles from './styles';

const imageIcon = require('assets/camera.png');

class ImageBlobInput extends Component {
  constructor(props) {
    super(props);
    this.takePicture = this.takePicture.bind(this);
  }

  async takePicture() {
    try {
      const image = await this.camera.capture();
      console.log(image);
    } catch (err) {
      console.warn('TODO: handle error', err);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => { this.camera = cam; }}
          style={styles.preview}
          aspect={Camera.constants.Aspect.fill}
          captureTarget={Camera.constants.CaptureTarget.temp}
        >
          <TouchableHighlight
            style={styles.capture}
            onPress={this.takePicture}
            activeOpacity={0.8}
            underlayColor={Theme.background.secondary}
          >
            <Image style={Theme.icon} source={imageIcon} />
          </TouchableHighlight>
        </Camera>
      </View>
    );
  }
}

ImageBlobInput.propTypes = {
  question: React.PropTypes.shape({
    label: React.PropTypes.string,
    defaultValue: React.PropTypes.string
  }).isRequired,
  input: React.PropTypes.shape({
    onBlur: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  }).isRequired,
  meta: React.PropTypes.shape({
    active: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    invalid: React.PropTypes.bool.isRequired,
    pristine: React.PropTypes.bool.isRequired,
    visited: React.PropTypes.bool.isRequired
  }).isRequired
};

export default ImageBlobInput;
