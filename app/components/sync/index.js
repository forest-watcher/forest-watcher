// @flow
import type { Thunk } from 'types/store.types';
import React, { Component } from 'react';
import { StatusBar, View, Text } from 'react-native';
import i18n from 'i18next';
import LottieView from 'lottie-react-native';
import ActionButton from 'components/common/action-button';
import styles from './styles';
import MapboxGL from '@react-native-mapbox-gl/maps';

const rangerAnimation = require('assets/animations/ranger.json');
const loadedAnimation = require('assets/animations/check.json');
const noConnectionAnimation = require('assets/animations/no_connection.json');

type Props = {
  isConnected: boolean,
  criticalSyncError: boolean,
  syncFinished: boolean,
  retrySync: () => Thunk<void>
};

class Sync extends Component<Props> {
  static options(passProps: {}) {
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
    if (!criticalSyncError) {
      return null;
    }
    return (
      <ActionButton
        monochrome
        noIcon
        style={styles.button}
        onPress={retrySync}
        text={i18n.t('sync.tryAgain').toUpperCase()}
      />
    );
  }

  render() {
    const { isConnected, syncFinished, criticalSyncError } = this.props;
    let animationSource = noConnectionAnimation;
    if (isConnected && !criticalSyncError) {
      animationSource = syncFinished ? loadedAnimation : rangerAnimation;
    }

    return (
      <View style={[styles.mainContainer, styles.center]}>
        <StatusBar networkActivityIndicatorVisible />
        {/*
         * The Mapbox native Android SDK crashes if the following steps are performed:
         * (i) Install fresh version of app and log into an account with an area
         * (ii) If running in dev mode, disable Live Reload / Fast Reload (see https://github.com/nitaliano/react-native-mapbox-gl/issues/1016#issuecomment-362048325)
         * (iii) Download the area offline (which uses Mapbox.OfflineManager)
         * (iv) Once finished, enable airplane mode, and open the area map. Crash!
         *
         * However, if the Mapbox map is viewed at any point before step (iv), then the crash does not occur.
         * The crash occurs in native Android code so it is not clear exactly why it occurs, but we can avoid the issue
         * by displaying an invisible dummy "MapView" here on the sync screen. Placing it here ensures that the map
         * has loaded at least once, and so works around the crash described above.
         *
         * This is disgusting but funnily enough we had to do something almost identical for Google Maps in v1. See Git
         * history for details.
         */}
        <MapboxGL.MapView style={styles.map} />
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
