import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  Image,
  StatusBar,
  TouchableHighlight
} from 'react-native';

import ImageCache from 'components/common/image-cache';
import { storeImage } from 'helpers/fileManagement';
import i18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';

const ImagePicker = require('react-native-image-picker');

const cameraIcon = require('assets/camera.png');
const cameraAddIcon = require('assets/camera_add.png');

class ImageBlobInput extends Component {
  constructor(props) {
    super(props);
    this.removePicture = this.removePicture.bind(this);
    this.state = {
      source: ''
    };
  }

  componentDidMount() {
    this.launch();
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');
  }

  launch = () => {
    const options = {
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: true
      }
    };
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        this.props.input.onChange('');
      } else if (response.error) {
        console.warn(response.error);
      } else {
        const path = response.path;
        this.savePicture(path);
      }
    });
  }

  removePicture() {
    this.props.input.onChange('');
    this.setState({
      cameraVisible: true
    });
  }

  async savePicture(path) {
    try {
      const storedUrl = await storeImage(path, true);
      this.setState({
        source: storedUrl
      }, () => {
        this.props.input.onChange(storedUrl);
      });
    } catch (err) {
      console.warn('TODO: handle error', err);
    }
  }

  renderConfirmView() {
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

  renderCameraView() {
    return (
      <View style={styles.container}>
        <Text style={styles.captureLabel} >{i18n.t('report.takePicture')}</Text>
        <View pointerEvents="none" style={styles.cameraContainer}>
          {this.state.source &&
            <Image style={{ width: 100, height: 200 }} source={this.state.source} />
          }
        </View>
        <TouchableHighlight
          style={[styles.captureBtn, this.state.saving ? styles.captureBtnDisabled : '']}
          activeOpacity={0.8}
          underlayColor={Theme.background.secondary}
        >
          <Image style={Theme.icon} source={cameraIcon} />
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    const cameraVisible = this.state.cameraVisible;
    StatusBar.setBarStyle(cameraVisible ? 'light-content' : 'default');
    return cameraVisible ? this.renderCameraView() : this.renderConfirmView();
  }
}

ImageBlobInput.propTypes = {
  input: PropTypes.shape({
    onBlur: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onFocus: PropTypes.func.isRequired,
    value: PropTypes.any.isRequired
  }).isRequired
};

export default ImageBlobInput;
