import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StatusBar,
  TouchableHighlight
} from 'react-native';
import Camera from 'react-native-camera';

import i18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';

const cameraIcon = require('assets/camera.png');
const cameraAddIcon = require('assets/camera_add.png');

class ImageBlobInput extends Component {
  constructor(props) {
    super(props);
    this.takePicture = this.takePicture.bind(this);
    this.removePicture = this.removePicture.bind(this);
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');
  }

  getCameraView() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => { this.camera = cam; }}
          style={styles.camera}
          aspect={Camera.constants.Aspect.fill}
          captureTarget={Camera.constants.CaptureTarget.disk}
        >
          <Text style={styles.captureLabel} >{i18n.t('report.takePicture')}</Text>
          <TouchableHighlight
            style={styles.captureBtn}
            onPress={this.takePicture}
            activeOpacity={0.8}
            underlayColor={Theme.background.secondary}
          >
            <Image style={Theme.icon} source={cameraIcon} />
          </TouchableHighlight>
        </Camera>
      </View>
    );
  }

  getConfirmView() {
    return (
      <View style={styles.container}>
        <View style={styles.preview}>
          {this.props.input.value &&
            <Image resizeMode="contain" style={styles.previewImage} source={{ uri: this.props.input.value }} />
          }
        </View>
        <TouchableHighlight
          style={styles.leftBtn}
          onPress={this.removePicture}
          activeOpacity={0.8}
          underlayColor={Theme.background.white}
        >
          <Image style={[Theme.icon, styles.leftBtnIcon]} source={cameraAddIcon} />
        </TouchableHighlight>
      </View>
    );
  }

  removePicture() {
    this.props.input.onChange('');
  }

  async takePicture() {
    try {
      const image = await this.camera.capture();
      this.props.input.onChange(image.path);
    } catch (err) {
      console.warn('TODO: handle error', err);
    }
  }

  render() {
    const hasImage = this.props.input.value;
    StatusBar.setBarStyle(hasImage ? 'default' : 'light-content');
    return hasImage ? this.getConfirmView() : this.getCameraView();
  }
}

ImageBlobInput.propTypes = {
  input: React.PropTypes.shape({
    onBlur: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  }).isRequired
};

export default ImageBlobInput;
