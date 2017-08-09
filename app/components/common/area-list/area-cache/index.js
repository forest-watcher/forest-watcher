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

const Timer = require('react-native-timer');
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
      complete: PropTypes.bool.isRequired
    }).isRequired,
    isConnected: PropTypes.bool.isRequired,
    resetCacheStatus: PropTypes.func.isRequired,
    showTooltip: PropTypes.bool.isRequired
  };

  state = {
    indeterminate: true,
    canRefresh: this.props.cacheStatus.complete
  };

  componentDidUpdate(prevProps) {
    if (prevProps.cacheStatus.requested !== this.props.cacheStatus.requested) {
      Timer.setTimeout(this, 'setIndeterminate', this.removeIndeterminate, 1000);
    }

    if (prevProps.cacheStatus.error !== this.props.cacheStatus.error && this.props.cacheStatus.error) {
      Alert.alert(
        I18n.t('commonText.error'),
        I18n.t('dashboard.downloadFailed'),
        [
          { text: 'OK', onPress: this.resetCacheStatus },
          { text: I18n.t('commonText.retry'), onPress: this.onRetry }
        ]
      );
    }

    if (!prevProps.cacheStatus.complete && this.props.cacheStatus) {
      Timer.setTimeout(this, 'canRefresh', this.setCanRefresh, 2000);
    }
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'setIndeterminate');
  }

  onDownload = () => {
    const { areaId, downloadAreaById } = this.props;
    downloadAreaById(areaId);
  }

  onRetry = () => {
    this.resetCacheStatus();
    this.onDownload();
  }

  onRefresh = () => {
    return null;
  }

  onOfflinePress = () => {
    Alert.alert(
      I18n.t('dashboard.unable'),
      I18n.t('dashboard.connectionRequired'),
      [{ text: 'OK' }]
    );
  }

  setCanRefresh = () => {
    this.setState(() => ({ canRefresh: true }));
  }

  getCacheAreaAction = () => {
    const { isConnected, cacheStatus } = this.props;
    const { canRefresh } = this.state;
    if (!isConnected) return this.onOfflinePress;
    if (!cacheStatus.complete) return this.onDownload;
    if (canRefresh && cacheStatus.complete) return this.onRefresh;
    return null;
  }

  getCacheAreaIcon = () => {
    const { cacheStatus } = this.props;
    const { canRefresh } = this.state;
    if (!cacheStatus.complete) return downloadIcon;
    if (!canRefresh) return downloadedIcon;
    return refreshIcon;
  }

  resetCacheStatus = () => {
    const { areaId, resetCacheStatus } = this.props;
    resetCacheStatus(areaId);
  }

  removeIndeterminate = () => {
    this.setState(() => ({ indeterminate: false }));
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
          activeOpacity={0.8}
          underlayColor={Theme.background.white}
          onPress={cacheAreaAction}
        >
          <Image style={Theme.icon} source={cacheButtonIcon} />
        </TouchableHighlight>
        {showTooltip &&
          <View style={styles.cacheTooltip}>
            <Text>Make available offline</Text>
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
    if (cacheStatus.requested && !cacheStatus.complete) return progressBar;
    return cacheButton;
  }
}

export default AreaCache;
