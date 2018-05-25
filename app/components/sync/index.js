// @flow

import React, { Component } from 'react';
import { StatusBar, View, Text } from 'react-native';
import i18n from 'locales';
import ActionButton from 'components/common/action-button';
import LottieView from 'lottie-react-native';
import styles from './styles';

const rangerAnimation = require('assets/animations/ranger.json');
const loadedAnimation = require('assets/animations/check.json');

type Props = {
  isConnected: boolean,
  criticalSyncError: boolean,
  syncFinished: boolean,
  retrySync: () => void
};

class Sync extends Component<Props> {
  static navigatorStyle = {
    navBarHidden: true
  };

  animation: ?{ play: () => void } = null;

  componentDidMount() {
    if (this.animation) {
      this.animation.play();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { syncFinished, isConnected } = this.props;
    if ((syncFinished !== prevProps.syncFinished
      || isConnected !== prevProps.isConnected) && this.animation) {
      this.animation.play();
    }
  }

  getTexts = () => {
    const { isConnected, syncFinished } = this.props;
    const texts = {};
    if (isConnected) {
      if (syncFinished) {
        texts.title = i18n.t('sync.title.updated');
        texts.subtitle = i18n.t('sync.subtitle.updated');
      } else {
        texts.title = i18n.t('sync.title.updating');
        texts.subtitle = i18n.t('sync.subtitle.updating');
      }
    } else {
      texts.title = i18n.t('sync.title.offline');
      texts.subtitle = i18n.t('sync.subtitle.offline');
    }
    return texts;
  }

  getContent() {
    const { criticalSyncError } = this.props;
    const { title, subtitle } = this.getTexts();
    if (criticalSyncError) {
      return (
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {i18n.t('sync.error')}
          </Text>
          <Text style={styles.subtitle}>
            {i18n.t('sync.errorDesc')}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.textContainer}>
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
    if (!criticalSyncError) return null;
    return (
      <View>
        <ActionButton
          monochrome
          noIcon
          style={styles.button}
          onPress={retrySync} // TODO: retry again
          text={i18n.t('sync.tryAgain').toUpperCase()}
        />
      </View>
    );
  }

  render() {
    const { isConnected, syncFinished } = this.props;
    return (
      <View style={[styles.mainContainer, styles.center]}>
        <StatusBar networkActivityIndicatorVisible />
        {isConnected &&
          <LottieView
            loop={!syncFinished}
            source={syncFinished ? loadedAnimation : rangerAnimation}
            ref={animation => {
              this.animation = animation;
            }}
          />
        }
        {this.getContent()}
        {this.getAction()}
      </View>
    );
  }
}

export default Sync;
