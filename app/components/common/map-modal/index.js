import React, { Component } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const headerBackgroundImage = require('assets/map_bg_gradient.png');
const closeImage = require('assets/close_white.png');

class MapModal extends Component {
  close() {
    this.props.onClosePress();
  }

  render() {
    return (
      <Modal
        animationType={'slide'}
        transparent
        visible={this.props.visible}
        onRequestClose={() => this.close()}
      >
        <View style={styles.header}>
          <Image
            style={styles.headerBg}
            source={headerBackgroundImage}
          />
          <Text style={styles.headerTitle}>
            Select a protected area
          </Text>
          <TouchableHighlight
            style={styles.closeIcon}
            onPress={() => this.close()}
            activeOpacity={0.8}
            underlayColor={'transparent'}
          >
            <Image style={Theme.icon} source={closeImage} />
          </TouchableHighlight>
        </View>
        {this.props.visible
          ? this.props.children
          : null
        }
      </Modal>
    );
  }
}

MapModal.propTypes = {
  visible: React.PropTypes.bool,
  children: React.PropTypes.node,
  onClosePress: React.PropTypes.func.isRequired
};

export default MapModal;
