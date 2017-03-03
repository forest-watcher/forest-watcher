import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StatusBar,
  TouchableHighlight
} from 'react-native';
import Camera from 'react-native-camera';

import ImageCache from 'components/common/image-cache';
import { storeImage } from 'helpers/fileManagement';
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
    this.timerLoadPicture = null;
    this.state = {
      cameraVisible: true
    };
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');

    if (this.timerLoadPicture) {
      clearTimeout(this.timerLoadPicture);
    }
  }

  getCameraView() {
    return (
      <View style={styles.container}>
        <Camera
          ref={(cam) => { this.camera = cam; }}
          style={styles.camera}
          aspect={Camera.constants.Aspect.fit}
          captureTarget={Camera.constants.CaptureTarget.cameraRoll}
          captureQuality={Camera.constants.CaptureQuality.medium}
        />
        <Text style={styles.captureLabel} >{i18n.t('report.takePicture')}</Text>
        <TouchableHighlight
          style={styles.captureBtnContainter}
          onPress={this.takePicture}
          activeOpacity={0.8}
          underlayColor={Theme.background.secondary}
        >
          <View style={styles.captureBtn} >
            <Image style={Theme.icon} source={cameraIcon} />
          </View>
        </TouchableHighlight>
      </View>
    );
  }

  getConfirmView() {
    let image = <Text>{i18n.t('commonText.loading')}</Text>;

    if (this.props.input.value && this.props.input.value.length > 0) {
      image = (<ImageCache
        resizeMode="contain"
        style={{ height: 416, width: Theme.screen.width - (56 * 2) }}
        localSource
        source={{
          uri: this.props.input.value
        }}
      />);
    }

    return (
      <View style={styles.container}>
        <View style={styles.preview}>{image}</View>
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
    this.setState({
      cameraVisible: true
    });
  }

  async takePicture() {
    try {
      const image = await this.camera.capture();
      const storedUrl = await storeImage(image.path, true);
      this.setState({
        cameraVisible: false
      }, () => {
        this.timerLoadPicture = setTimeout(() => {
          this.props.input.onChange(storedUrl);
        }, 1000);
      });
    } catch (err) {
      console.warn('TODO: handle error', err);
    }
  }

  render() {
    const cameraVisible = this.state.cameraVisible;
    StatusBar.setBarStyle(cameraVisible ? 'light-content' : 'default');
    return cameraVisible ? this.getCameraView() : this.getConfirmView();
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
