// @flow

import React, { Component } from 'react';
import { StatusBar, View, Text } from 'react-native';
import i18n from 'i18next';
import LottieView from 'lottie-react-native';
import MapView from 'react-native-maps';
import ActionButton from 'components/common/action-button';
import styles from './styles';

const rangerAnimation = require('assets/animations/ranger.json');
const loadedAnimation = require('assets/animations/check.json');
const noConnectionAnimation = require('assets/animations/no_connection.json');

type Props = {
  isConnected: boolean,
  criticalSyncError: boolean,
  syncFinished: boolean,
  retrySync: () => void
};

class Sync extends Component<Props> {
  static options(passProps) {
    return {
      topBar: {
        drawBehind: true,
        visible: false
      }
    };
  }

  animation: ?{ play: () => void } = null;

  componentDidMount() {
    if (this.animation) {
      this.animation.play();
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { syncFinished, isConnected } = this.props;
    if ((syncFinished !== prevProps.syncFinished || isConnected !== prevProps.isConnected) && this.animation) {
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
  };

  getContent() {
    const { criticalSyncError } = this.props;
    const { title, subtitle } = this.getTexts();
    if (criticalSyncError) {
      return (
        <View style={styles.textContainer}>
          <Text style={styles.title}>{i18n.t('sync.error')}</Text>
          <Text style={styles.subtitle}>{i18n.t('sync.errorDesc')}</Text>
        </View>
      );
    }

    return (
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    );
  }

  getAction() {
    const { criticalSyncError, retrySync } = this.props;
    if (!criticalSyncError) return null;
    return (
      <ActionButton
        monochrome
        noIcon
        style={styles.button}
        onPress={retrySync} // TODO: retry again
        text={i18n.t('sync.tryAgain').toUpperCase()}
      />
    );
  }

  render() {
    const { isConnected, syncFinished, criticalSyncError } = this.props;
    let animationSource = noConnectionAnimation;
    if (isConnected && !criticalSyncError) animationSource = syncFinished ? loadedAnimation : rangerAnimation;

    return (
      <View style={[styles.mainContainer, styles.center]}>
        <StatusBar networkActivityIndicatorVisible />
        {/*
         * Google Maps must verify its API token over the internet before it can be used.
         * This is done automatically the first time a map is displayed.
         * However, if a GFW user were to download an offline tileset without ever opening the map, they would find that
         * any map views they view would fail to work once offline, because Google Maps has not verified its token.
         * For that reason we use this workaround where we show an invisible mapView on this screen (a point at which
         * the user has connection) to ensure Google Maps is verified.
         * Ultimately, this is caused by Google Maps not really being geared for total offline use, and we can remove
         * this workaround when/if we switch to a pure Mapbox implementation.
         */}
        <MapView style={styles.map} provider={MapView.PROVIDER_GOOGLE} mapType="none" />
        <LottieView
          style={styles.animation}
          loop={!syncFinished}
          source={animationSource}
          ref={animation => {
            this.animation = animation;
          }}
        />
        {this.getContent()}
        {this.getAction()}
      </View>
    );
  }
}

export default Sync;
