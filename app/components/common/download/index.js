// @flow
import type { DownloadDataType } from 'types/sharing.types';
import type { Thunk } from 'types/store.types';
import React, { PureComponent } from 'react';
import { TouchableHighlight, View, Alert, Image } from 'react-native';

import Config from 'react-native-config';
import checkConnectivity from 'helpers/networking';

import i18n from 'i18next';
import Callout from 'components/common/callout';
import ProgressBar from 'react-native-progress/Bar';
import Theme from 'config/theme';
import styles from './styles';

import {
  trackRouteDownloadFlowStarted,
  trackRouteDownloadFlowEnded,
  trackAreaDownloadFlowEnded,
  trackAreaDownloadFlowStarted
} from 'helpers/analytics';

const downloadIcon = require('assets/download.png');
const refreshIcon = require('assets/refresh.png');
const downloadedIcon = require('assets/downloaded.png');

type Props = {
  dataType: DownloadDataType,
  id: string, // the region's identifier
  downloadById: string => Thunk<void>,
  downloadProgress: {
    requested: boolean,
    progress: number,
    error: boolean,
    completed: boolean
  },
  resetCacheStatus: string => Thunk<void>,
  isOfflineMode: boolean,
  showTooltip: boolean,
  refreshCacheById: (id: string, type: DownloadDataType) => Thunk<void>,
  showNotConnectedNotification: () => Thunk<void>
};

type State = {
  checkingConnectivity: boolean,
  canRefresh: boolean
};

class DataCacher extends PureComponent<Props, State> {
  static defaultProps = {
    downloadProgress: {
      progress: 0,
      completed: false,
      requested: false,
      error: false
    }
  };

  state = {
    checkingConnectivity: false,
    canRefresh: this.props.downloadProgress.completed
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.downloadProgress.error && this.props.downloadProgress.completed) {
      Alert.alert(i18n.t('commonText.error'), i18n.t('dashboard.downloadFailed'), [
        { text: 'OK', onPress: this.resetCacheStatus },
        { text: i18n.t('commonText.retry'), onPress: this.onRetry }
      ]);
    }

    if (prevProps.downloadProgress.requested === false && this.props.downloadProgress.requested === true) {
      if (this.props.dataType === 'route') {
        trackRouteDownloadFlowStarted(this.props.id);
      } else {
        trackAreaDownloadFlowStarted(this.props.id);
      }
    }

    if (prevProps.downloadProgress.completed === false && this.props.downloadProgress.completed === true) {
      if (this.props.dataType === 'route') {
        trackRouteDownloadFlowEnded(this.props.id, !this.props.downloadProgress.error);
      } else {
        trackAreaDownloadFlowEnded(this.props.id, !this.props.downloadProgress.error);
      }
    }
  }

  onDownload = () => {
    // Update the state as we're now checking connectivity.
    // It'll show the progress bar while we're awaiting a connection.
    this.setState({
      checkingConnectivity: true
    });
    checkConnectivity(Config.API_URL).then(connected => {
      // Update the state again now we've finished checking connectivity.
      this.setState({
        checkingConnectivity: false
      });
      if (!connected) {
        this.onOfflinePress();
        return;
      }

      const { id, downloadById } = this.props;
      downloadById(id);
      return;
    });
  };

  onRetry = () => {
    this.resetCacheStatus();
    const action = this.getCacheAreaAction();
    if (action) {
      action();
    }
  };

  onRefresh = () => {
    const { dataType, id, refreshCacheById } = this.props;
    this.setState({ canRefresh: false });
    this.resetCacheStatus();
    refreshCacheById(id, dataType);
  };

  onOfflinePress = () => this.props.showNotConnectedNotification();

  getCacheAreaAction = () => {
    const { downloadProgress, isOfflineMode } = this.props;
    const { canRefresh } = this.state;
    if (isOfflineMode) {
      return this.onOfflinePress;
    }
    if (!downloadProgress.completed) {
      return this.onDownload;
    }
    if (canRefresh && downloadProgress.completed) {
      return this.onRefresh;
    }
    return null;
  };

  getCacheAreaIcon = () => {
    const { downloadProgress } = this.props;
    const { canRefresh } = this.state;

    if (!downloadProgress.completed) {
      return downloadIcon;
    }
    if (!canRefresh) {
      return downloadedIcon;
    }
    return refreshIcon;
  };

  resetCacheStatus = () => {
    const { id, resetCacheStatus } = this.props;
    resetCacheStatus(id);
  };

  render() {
    const { downloadProgress, showTooltip } = this.props;
    const { checkingConnectivity } = this.state;
    const cacheAreaAction = this.getCacheAreaAction();
    const cacheButtonIcon = this.getCacheAreaIcon();

    const cacheButton = (
      <Callout
        body={i18n.t('areas.tooltip.body')}
        offset={4}
        title={i18n.t('areas.tooltip.title')}
        visible={showTooltip}
      >
        <View style={styles.cacheBtnContainer}>
          <TouchableHighlight
            style={styles.cacheBtn}
            activeOpacity={1}
            underlayColor={Theme.background.secondary}
            onPress={cacheAreaAction}
          >
            <Image source={cacheButtonIcon} />
          </TouchableHighlight>
        </View>
      </Callout>
    );
    const progressBar = (
      <View style={styles.progressBarContainer}>
        <ProgressBar
          indeterminate={downloadProgress.progress === 0}
          progress={downloadProgress.progress / 100}
          width={Theme.screen.width}
          height={4}
          color={Theme.colors.turtleGreen}
          borderRadius={0}
          borderColor="transparent"
        />
      </View>
    );
    if ((downloadProgress.requested && !downloadProgress.completed) || checkingConnectivity) {
      return progressBar;
    }
    return cacheButton;
  }
}

export default DataCacher;
