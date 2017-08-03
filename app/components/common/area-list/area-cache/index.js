import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View
} from 'react-native';

import i18n from 'locales';
import ProgressBar from 'react-native-progress/Bar';
import Row from 'components/common/row';
import Theme from 'config/theme';
import styles from './styles';

const Timer = require('react-native-timer');
const downloadIcon = require('assets/upload.png');

class AreaCache extends PureComponent {

  static propTypes = {
    areaId: PropTypes.string.isRequired,
    downloadAreaById: PropTypes.func.isRequired,
    cacheStatus: PropTypes.shape({
      requested: PropTypes.bool.isRequired,
      progress: PropTypes.number.isRequired
    }).isRequired
  };

  state = {
    indeterminate: true
  };

  componentDidUpdate(prevProps) {
    if (prevProps.cacheStatus.requested !== prevProps.requested) {
      Timer.setTimeout(this, 'setIndeterminate', this.removeIndeterminate, 1000);
    }
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'setIndeterminate');
  }

  onDownload = () => {
    const { areaId, downloadAreaById } = this.props;
    downloadAreaById(areaId);
  }

  removeIndeterminate = () => {
    this.setState(() => ({ indeterminate: false }));
  }

  render() {
    const { cacheStatus } = this.props;
    const { indeterminate } = this.state;
    const cacheAreaAction = {
      icon: downloadIcon,
      callback: this.onDownload
    };
    const cacheRow = (
      <Row action={cacheAreaAction}>
        <Text style={styles.title}>{i18n.t('dashboard.downloadArea')}</Text>
      </Row>
    );
    const progressRow = (
      <Row>
        <View style={styles.rowContent}>
          <Text style={styles.title}>{i18n.t('dashboard.downloadingArea')}</Text>
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
