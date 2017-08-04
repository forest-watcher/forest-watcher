import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  Alert
} from 'react-native';

import I18n from 'locales';
import ProgressBar from 'react-native-progress/Bar';
import Row from 'components/common/row';
import Theme from 'config/theme';
import styles from './styles';

const Timer = require('react-native-timer');
const downloadIcon = require('assets/download.png');

class AreaCache extends PureComponent {

  static propTypes = {
    areaId: PropTypes.string.isRequired,
    downloadAreaById: PropTypes.func.isRequired,
    cacheStatus: PropTypes.shape({
      requested: PropTypes.bool.isRequired,
      progress: PropTypes.number.isRequired,
      error: PropTypes.bool.isRequired
    }).isRequired,
    isConnected: PropTypes.bool.isRequired,
    resetCacheStatus: PropTypes.func.isRequired
  };

  state = {
    indeterminate: true
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

  onOfflinePress = () => {
    Alert.alert(
      I18n.t('dashboard.unable'),
      I18n.t('dashboard.connectionRequired'),
      [{ text: 'OK' }]
    );
  }

  resetCacheStatus = () => {
    const { areaId, resetCacheStatus } = this.props;
    resetCacheStatus(areaId);
  }

  removeIndeterminate = () => {
    this.setState(() => ({ indeterminate: false }));
  }

  render() {
    const { cacheStatus, isConnected } = this.props;
    const { indeterminate } = this.state;
    const cacheAreaAction = {
      icon: downloadIcon,
      callback: isConnected ? this.onDownload : this.onOfflinePress
    };
    const cacheRow = (
      <Row opacity={1} action={cacheAreaAction}>
        <Text style={styles.title}>{I18n.t('dashboard.downloadArea')}</Text>
      </Row>
    );
    const progressRow = (
      <Row opacity={1}>
        <View style={styles.rowContent}>
          <Text style={styles.title}>{I18n.t('dashboard.downloadingArea')}</Text>
          <ProgressBar
            indeterminate={indeterminate}
            progress={cacheStatus.progress}
            width={(Theme.screen.width - 48)}
            color={Theme.colors.color1}
          />
        </View>
      </Row>
    );
    return (cacheStatus.requested ? progressRow : cacheRow);
  }
}

export default AreaCache;
