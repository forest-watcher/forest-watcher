// @flow

import React, { PureComponent } from 'react';
import {
  TouchableHighlight,
  View,
  Alert,
  Image,
  Text
} from 'react-native';

import Config from 'react-native-config';
import checkConnectivity from 'helpers/networking';

import i18n from 'locales';
import ProgressBar from 'react-native-progress/Bar';
import Theme from 'config/theme';
import styles from './styles';

const downloadIcon = require('assets/download.png');
const refreshIcon = require('assets/refresh.png');
const downloadedIcon = require('assets/downloaded.png');

type Props = {
  areaId: string,
  downloadAreaById: string => void,
  cacheStatus: {
    requested: boolean,
    progress: number,
    error: boolean,
    completed: boolean
  },
  isConnected: boolean,
  resetCacheStatus: string => void,
  showTooltip: boolean,
  refreshAreaCacheById: string => void,
  pendingCache: number,
  showNotConnectedNotification: () => void
}
type State = {
  indeterminate: boolean,
  canRefresh: boolean
}

class AreaCache extends PureComponent<Props, State> {

  static defaultProps = {
    cacheStatus: {
      progress: 0,
      completed: false,
      requested: false,
      error: false
    }
  };

  state = {
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
      Alert.alert(
        i18n.t('commonText.error'),
        i18n.t('dashboard.downloadFailed'),
        [
          { text: 'OK', onPress: this.resetCacheStatus },
          { text: i18n.t('commonText.retry'), onPress: this.onRetry }
        ]
      );
    }
  }

  onDownload = () => {
    // Update the state as we're now checking connectivity.
    // It'll show the progress bar while we're awaiting a connection.
    this.setState({
        checkingConnectivity: true
    })
    checkConnectivity(Config.API_URL).then(connected => {
      // Update the state again now we've finished checking connectivity.
      this.setState({
          checkingConnectivity: false
      })
      if (!connected) {
        this.onOfflinePress();
        return;
      }

      const { areaId, downloadAreaById } = this.props;
      downloadAreaById(areaId);
    });
  }

  onRetry = () => {
    this.resetCacheStatus();
    const action = this.getCacheAreaAction();
    if (action) action();
  }

  onRefresh = () => {
    const { areaId, refreshAreaCacheById } = this.props;
    this.setState({ canRefresh: false });
    this.resetCacheStatus();
    refreshAreaCacheById(areaId);
  }

  onOfflinePress = () => this.props.showNotConnectedNotification();

  getCacheAreaAction = () => {
    const { cacheStatus } = this.props;
    const { canRefresh } = this.state;
    if (!cacheStatus.completed) return this.onDownload;
    if (canRefresh && cacheStatus.completed) return this.onRefresh;
    return null;
  }

  getCacheAreaIcon = () => {
    const { cacheStatus } = this.props;
    const { canRefresh } = this.state;
    if (!cacheStatus.completed) return downloadIcon;
    if (!canRefresh) return downloadedIcon;
    return refreshIcon;
  }

  setIndeterminate = (indeterminate: boolean) => {
    this.setState(() => ({ indeterminate }));
  }

  resetCacheStatus = () => {
    const { areaId, resetCacheStatus } = this.props;
    resetCacheStatus(areaId);
  }

  render() {
    const { cacheStatus, showTooltip } = this.props;
    const { indeterminate, checkingConnectivity } = this.state;
    const cacheAreaAction = this.getCacheAreaAction();
    const cacheButtonIcon = this.getCacheAreaIcon();

    const cacheButton = (
      <View style={styles.cacheBtnContainer}>
        <TouchableHighlight
          style={styles.cacheBtn}
          activeOpacity={1}
          underlayColor={Theme.background.secondary}
          onPress={cacheAreaAction}
        >
          <Image style={Theme.icon} source={cacheButtonIcon} />
        </TouchableHighlight>
        {showTooltip &&
          <View style={styles.cacheTooltipContainer}>
            <View style={styles.cacheTooltipArrow} />
            <View style={styles.cacheTooltip}>
              <Text>{i18n.t('dashboard.makeAvailableOffline')}</Text>
            </View>
          </View>
        }
      </View>
    );
    const progressBar = (
      <View style={styles.progressBarContainer}>
        <ProgressBar
          indeterminate={indeterminate}
          progress={cacheStatus.progress}
          width={Theme.screen.width}
          height={4}
          color={Theme.colors.color1}
          borderRadius={0}
          borderColor="transparent"
        />
      </View>
    );
    if ((cacheStatus.requested && !cacheStatus.completed) || checkingConnectivity) return progressBar;
    return cacheButton;
  }
}

export default AreaCache;
