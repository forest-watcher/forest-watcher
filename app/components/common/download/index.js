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

import tracker from 'helpers/googleAnalytics';

const downloadIcon = require('assets/download.png');
const refreshIcon = require('assets/refresh.png');
const downloadedIcon = require('assets/downloaded.png');

type Props = {
  dataType: DownloadDataType,
  id: string,
  downloadById: string => Thunk<void>,
  cacheStatus: {
    requested: boolean,
    progress: number,
    error: boolean,
    completed: boolean
  },
  disabled: boolean,
  resetCacheStatus: string => Thunk<void>,
  isOfflineMode: boolean,
  showTooltip: boolean,
  refreshCacheById: string => Thunk<void>,
  pendingCache: number,
  showNotConnectedNotification: () => Thunk<void>
};

type State = {
  checkingConnectivity: boolean,
  indeterminate: boolean,
  canRefresh: boolean
};

class DataCacher extends PureComponent<Props, State> {
  static defaultProps = {
    cacheStatus: {
      progress: 0,
      completed: false,
      requested: false,
      error: false
    },
    disabled: false
  };

  state = {
    checkingConnectivity: false,
    indeterminate: this.props.cacheStatus.progress === 0,
    canRefresh: this.props.cacheStatus.completed
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.cacheStatus.progress > 0 && this.props.cacheStatus.progress === 0) {
      this.setIndeterminate(true);
    }

    if (prevProps.cacheStatus.progress === 0 && this.props.cacheStatus.progress > 0) {
      this.setIndeterminate(false);
    }

    if (this.props.cacheStatus.error && prevProps.pendingCache > 0 && this.props.pendingCache === 0) {
      Alert.alert(i18n.t('commonText.error'), i18n.t('dashboard.downloadFailed'), [
        { text: 'OK', onPress: this.resetCacheStatus },
        { text: i18n.t('commonText.retry'), onPress: this.onRetry }
      ]);
    }

    if (prevProps.cacheStatus.progress === 0 && this.props.cacheStatus.progress > 0 && this.props.dataType === 'area') {
      tracker.trackAreaDownloadStartedEvent();
    }

    if (this.props.pendingCache === 0 && prevProps.pendingCache > 0 && this.props.dataType === 'area') {
      tracker.trackAreaDownloadEndedEvent(!this.props.cacheStatus.error);
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
    const { id, refreshCacheById } = this.props;
    this.setState({ canRefresh: false });
    this.resetCacheStatus();
    refreshCacheById(id);
  };

  onOfflinePress = () => this.props.showNotConnectedNotification();

  getCacheAreaAction = () => {
    const { cacheStatus, isOfflineMode } = this.props;
    const { canRefresh } = this.state;
    if (isOfflineMode) {
      return this.onOfflinePress;
    }
    if (!cacheStatus.completed) {
      return this.onDownload;
    }
    if (canRefresh && cacheStatus.completed) {
      return this.onRefresh;
    }
    return null;
  };

  getCacheAreaIcon = () => {
    const { cacheStatus } = this.props;
    const { canRefresh } = this.state;
    if (!cacheStatus.completed) {
      return downloadIcon;
    }
    if (!canRefresh) {
      return downloadedIcon;
    }
    return refreshIcon;
  };

  setIndeterminate = (indeterminate: boolean) => {
    this.setState(() => ({ indeterminate }));
  };

  resetCacheStatus = () => {
    const { id, resetCacheStatus } = this.props;
    resetCacheStatus(id);
  };

  render() {
    const { cacheStatus, disabled, showTooltip } = this.props;
    const { indeterminate, checkingConnectivity } = this.state;
    const cacheAreaAction = this.getCacheAreaAction();
    const cacheButtonIcon = this.getCacheAreaIcon();

    // TODO: Should routes include a callout?
    const cacheButton = (
      <Callout
        body={i18n.t('areas.tooltip.body')}
        offset={4}
        title={i18n.t('areas.tooltip.title')}
        visible={showTooltip}
      >
        <View style={styles.cacheBtnContainer}>
          <TouchableHighlight
            disabled={disabled}
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
          indeterminate={indeterminate}
          progress={cacheStatus.progress}
          width={Theme.screen.width}
          height={4}
          color={Theme.colors.turtleGreen}
          borderRadius={0}
          borderColor="transparent"
        />
      </View>
    );
    if ((cacheStatus.requested && !cacheStatus.completed) || checkingConnectivity) {
      return progressBar;
    }
    return cacheButton;
  }
}

export default DataCacher;
