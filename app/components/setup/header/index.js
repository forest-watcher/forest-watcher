import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';

import Theme from 'config/theme';
import i18n from 'locales';
import styles from './styles';

const backIcon = require('assets/previous.png');
const backIconWhite = require('assets/previous_white.png');
const layersIcon = require('assets/layers.png');

class SetupHeader extends Component {

  static propTypes = {
    title: PropTypes.string,
    componentId: PropTypes.string,
    logout: PropTypes.func.isRequired,
    showBack: PropTypes.bool,
    onBackPress: (props, propName, componentName) => {
      if (props.showBack && !props[propName]) {
        return new Error(`${i18n.t('setupHeader.errorFirst')} ${propName}
      ${i18n.t('setupHeader.errorSecond')}  ${componentName}. ${i18n.t('setupHeader.errorThird')}`);
      }
      return null;
    },
    page: PropTypes.number.isRequired
  };

  onContextualLayersPress = () => {
    /*
    this.props.navigator.toggleDrawer({
      side: 'right',
      animated: true
    });
    */
  }

  onLogoutPress = () => {
    this.props.logout();
    Navigation.setStackRoot(this.props.componentId, {
      component: {
        name: 'ForestWatcher.Home'
      }
    });
  }

  render() {
    const { page, showBack, onBackPress, title } = this.props;
    const showBackStyle = showBack ? '' : styles.margin;
    const titleColor = page === 1 ? { color: 'white' } : { color: Theme.fontColors.main };
    const titleElement = (
      <Text style={[styles.title, showBackStyle, titleColor]}>
        {title}
      </Text>
    );
    return (
      <View style={styles.container}>
        <View style={styles.arrowText}>
          {showBack &&
            <TouchableHighlight
              style={styles.backIcon}
              onPress={onBackPress}
              activeOpacity={0.5}
              underlayColor="transparent"
            >
              <View style={styles.titleContainer}>
                <Image style={Theme.icon} source={page === 1 ? backIconWhite : backIcon} />
                {titleElement}
              </View>
            </TouchableHighlight>
          }
          {!showBack && titleElement}
        </View>
        {page === 0 && !showBack &&
        <TouchableHighlight
          style={styles.rightButton}
          onPress={this.onLogoutPress}
          activeOpacity={0.5}
          underlayColor="transparent"
        >
          <Text style={styles.logout}>Logout</Text>
        </TouchableHighlight>
        }
        {page === 1 &&
          <TouchableHighlight
            style={styles.rightButton}
            onPress={this.onContextualLayersPress}
            activeOpacity={0.5}
            underlayColor="transparent"
          >
            <Image
              source={layersIcon}
            />
          </TouchableHighlight>
        }
      </View>
    );
  }
}

export default SetupHeader;
