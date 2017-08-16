import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  TouchableHighlight,
  View,
  Alert,
  Image,
  Text
} from 'react-native';

import I18n from 'locales';
import ProgressBar from 'react-native-progress/Bar';
import Theme from 'config/theme';
import styles from './styles';

const downloadIcon = require('assets/download.png');
const refreshIcon = require('assets/refresh.png');
const downloadedIcon = require('assets/downloaded.png');

class AreaCache extends PureComponent {

  static propTypes = {
    areaId: PropTypes.string.isRequired,
    downloadAreaById: PropTypes.func.isRequired,
    cacheStatus: PropTypes.shape({
      requested: PropTypes.bool.isRequired,
      progress: PropTypes.number.isRequired,
      error: PropTypes.bool.isRequired,
      completed: PropTypes.bool.isRequired
    }).isRequired,
    isConnected: PropTypes.bool.isRequired,
    resetCacheStatus: PropTypes.func.isRequired,
    showTooltip: PropTypes.bool.isRequired,
    refreshAreaCacheById: PropTypes.func.isRequired,
    pendingCache: PropTypes.number.isRequired
  };

  state = {
    indeterminate: this.props.cacheStatus.progress === 0,
    canRefresh: this.props.cacheStatus.completed
  };

  componentDidUpdate(prevProps) {
    if (prevProps.cacheStatus.progress > 0 && this.props.cacheStatus.progress === 0) {
      this.setIndeterminate(true);
    }

    if (prevProps.cacheStatus.progress === 0 && this.props.cacheStatus.progress > 0) {
      this.setIndeterminate(false);
    }

    if (this.props.cacheStatus.error && prevProps.pendingCache > 0 && this.props.pendingCache === 0) {
      Alert.alert(
        I18n.t('commonText.error'),
        I18n.t('dashboard.downloadFailed'),
        [
          { text: 'OK', onPress: this.resetCacheStatus },
          { text: I18n.t('commonText.retry'), onPress: this.onRetry }
        ]
      );
    }
  }

  onDownload = () => {
    const { areaId, downloadAreaById } = this.props;
    downloadAreaById(areaId);
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

  onOfflinePress = () => {
    Alert.alert(
      I18n.t('dashboard.unable'),
      I18n.t('dashboard.connectionRequired'),
      [{ text: 'OK' }]
    );
  }

  getCacheAreaAction = () => {
    const { isConnected, cacheStatus } = this.props;
    const { canRefresh } = this.state;
    if (!isConnected) return this.onOfflinePress;
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

  setIndeterminate = (indeterminate) => {
    this.setState(() => ({ indeterminate }));
  }

  resetCacheStatus = () => {
    const { areaId, resetCacheStatus } = this.props;
    resetCacheStatus(areaId);
  }

  render() {
    const { cacheStatus, showTooltip } = this.props;
    const { indeterminate } = this.state;
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
              <Text>Make available offline</Text>
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
    if (cacheStatus.requested && !cacheStatus.completed) return progressBar;
    return cacheButton;
  }
}

export default AreaCache;
