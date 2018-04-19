import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StatusBar, View, ActivityIndicator, Text } from 'react-native';
import Theme from 'config/theme';
import I18n from 'locales';
import ActionButton from 'components/common/action-button';
import styles from './styles';

class Sync extends Component {
  static navigatorStyle = {
    navBarHidden: true
  };

  getTexts = () => {
    const { isConnected, actionsPending } = this.props;
    const texts = {};
    if (isConnected) {
      if (actionsPending > 0) {
        texts.title = I18n.t('sync.title.wifi');
        texts.subtitle = I18n.t('sync.subtitle.wifi');
      } else {
        texts.title = I18n.t('sync.title.updated');
        texts.subtitle = I18n.t('sync.subtitle.updated');
      }
    } else {
      texts.title = I18n.t('sync.title.offline');
      texts.subtitle = I18n.t('sync.subtitle.offline');
    }
    return texts;
  }

  getContent() {
    const { isConnected, actionsPending, criticalSyncError } = this.props;
    const { title, subtitle } = this.getTexts();
    if (criticalSyncError) {
      return (
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {I18n.t('sync.error')}
          </Text>
          <Text style={styles.subtitle}>
            {I18n.t('sync.errorDesc')}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.textContainer}>
        {isConnected && actionsPending > 0 &&
        <ActivityIndicator
          color={Theme.colors.color1}
          style={{ height: 80 }}
          size="large"
        />
        }
        <Text style={styles.title}>
          {title}
        </Text>
        <Text style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    );
  }

  getAction() {
    const { criticalSyncError, retrySync } = this.props;
    if (criticalSyncError) {
      return (
        <View>
          <ActionButton
            monochrome
            noIcon
            style={styles.button}
            onPress={retrySync} // TODO: retry again
            text={I18n.t('sync.tryAgain').toUpperCase()}
          />
        </View>
      );
    }
    return null;
  }

  render() {
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <StatusBar networkActivityIndicatorVisible />
        <View>
          {this.getContent()}
          {this.getAction()}
        </View>
      </View>
    );
  }
}

Sync.propTypes = {
  isConnected: PropTypes.bool.isRequired,
  criticalSyncError: PropTypes.bool.isRequired,
  actionsPending: PropTypes.number.isRequired,
  retrySync: PropTypes.func.isRequired
};

export default Sync;
