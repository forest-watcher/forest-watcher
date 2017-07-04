import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  View,
  Text,
  Image,
  StatusBar,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import styles from './styles';

const headerBackgroundImage = require('assets/map_bg_gradient.png');
const closeImage = require('assets/close_white.png');

class MapModal extends Component {
  componentDidMount() {
    StatusBar.setBarStyle('light-content');
  }

  componentWillUnmount() {
    StatusBar.setBarStyle('default');
  }

  close() {
    this.props.onClosePress();
    StatusBar.setBarStyle('default');
  }

  render() {
    return (
      <Modal
        animationType={'fade'}
        transparent
        visible={this.props.visible}
        onRequestClose={() => this.close()}
        hardwareAccelerated
      >
        <View
          style={styles.header}
          pointerEvents={'none'}
        >
          <Image
            style={styles.headerBg}
            source={headerBackgroundImage}
          />
          <Text
            style={styles.headerTitle}
          >
            {this.props.title}
          </Text>
        </View>
        <TouchableHighlight
          style={styles.closeIcon}
          onPress={() => this.close()}
          activeOpacity={0.8}
          underlayColor={'transparent'}
        >
          <Image style={Theme.icon} source={closeImage} />
        </TouchableHighlight>
        {this.props.visible
          ? this.props.children
          : null
        }
      </Modal>
    );
  }
}

MapModal.propTypes = {
  visible: PropTypes.bool,
  children: PropTypes.node,
  onClosePress: PropTypes.func.isRequired,
  title: PropTypes.string
};

export default MapModal;
