import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Camera from 'react-native-camera';

// import Theme from 'config/theme';
// import styles from '../styles';


class ImageInput extends Component {
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
          <Text style={styles.capture} onPress={this.takePicture}>[CAPTURE]</Text>
        </Camera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    color: '#000',
    padding: 10,
    margin: 40
  }
});

ImageInput.propTypes = {
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

export default ImageInput;
