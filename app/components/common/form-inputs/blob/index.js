import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  StatusBar,
  TouchableHighlight,
  PermissionsAndroid
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
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    this.takePicture = this.takePicture.bind(this);
    this.removePicture = this.removePicture.bind(this);
    this.state = {
      viewPrepared: false,
      cameraVisible: false,
      cameraType: Camera.constants.Type.back,
      saving: false
    };
  }

  componentDidMount() {
    this.getPermissions();
    if (this.camera !== undefined) {
      this.selectCameraType();
    }
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');
  }

  onNavigatorEvent(event) {
    if (event.type === 'ScreenChangedEvent' && event.id === 'didAppear') {
      this.setState({ viewPrepared: true });
    }
  }

  async getPermissions() {
    try {
      let isCameraPermitted = false;
      try {
        isCameraPermitted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      } catch (err) {
        console.warn(err);
      }
      if (!isCameraPermitted) {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: ''
          }
        );
        if (granted === false) {
          // TODO: Continue form without picture?
          console.warn('Please allow Camera');
        }
      }
      this.setState({
        cameraVisible: !this.props.input.value || this.props.input.value.length === 0
      });
    } catch (err) {
      console.warn(err);
    }
  }

  selectCameraType() {
    this.camera.hasFlash()
      .then((flash) => {
        if (!flash) {
          this.setState({
            cameraType: Camera.constants.Type.front
          });
        }
      })
      .catch((error) => { console.warn(error); });
  }

  removePicture() {
    this.props.input.onChange('');
    this.setState({
      cameraVisible: true
    });
  }

  async takePicture() {
    const image = await this.camera.capture();
    this.savePicture(image);
  }

  async savePicture(image) {
    if (!this.state.saving) {
      this.setState({
        saving: true
      }, async () => {
        try {
          const storedUrl = await storeImage(image.path, true);
          this.setState({
            cameraVisible: false,
            saving: false
          }, () => {
            this.props.input.onChange(storedUrl);
          });
        } catch (err) {
          console.warn('TODO: handle error', err);
        }
      });
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
          <Camera
            ref={(cam) => { this.camera = cam; }}
            type={this.state.cameraType}
            style={styles.camera}
            aspect={Camera.constants.Aspect.fit}
            captureTarget={Camera.constants.CaptureTarget.disk}
            captureQuality={Camera.constants.CaptureQuality.medium}
            onFocusChanged={() => {}}
            onZoomChanged={() => {}}
            defaultTouchToFocus
            mirrorImage={false}
          />
        </View>
        <TouchableHighlight
          style={[styles.captureBtn, this.state.saving ? styles.captureBtnDisabled : '']}
          onPress={this.takePicture}
          activeOpacity={0.8}
          underlayColor={Theme.background.secondary}
        >
          <Image style={Theme.icon} source={cameraIcon} />
        </TouchableHighlight>
      </View>
    );
  }

  render() {
    if (this.state.viewPrepared) {
      const cameraVisible = this.state.cameraVisible;
      StatusBar.setBarStyle(cameraVisible ? 'light-content' : 'default');
      return cameraVisible ? this.renderCameraView() : this.renderConfirmView();
    }
    return this.renderConfirmView();
  }
}

ImageBlobInput.propTypes = {
  input: React.PropTypes.shape({
    onBlur: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onFocus: React.PropTypes.func.isRequired,
    value: React.PropTypes.any.isRequired
  }).isRequired,
  navigator: React.PropTypes.object
};

export default ImageBlobInput;
