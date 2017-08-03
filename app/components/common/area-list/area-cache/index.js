import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View
} from 'react-native';

import ProgressBar from 'react-native-progress/Bar';
import Row from 'components/common/row';
import Theme from 'config/theme';
import styles from './styles';

const Timer = require('react-native-timer');
const downloadIcon = require('assets/upload.png');

class AreaCache extends PureComponent {

  static propTypes = {
    areaId: PropTypes.string.isRequired,
    downloadArea: PropTypes.func.isRequired,
    areaCache: PropTypes.shape({
      requested: PropTypes.bool.isRequired,
      progress: PropTypes.bool.isRequired
    }).isRequired
  };

  state = {
    indeterminate: true
  };

  componentDidUpdate(prevProps) {
    if (prevProps.areaCache.requested !== prevProps.requested) {
      Timer.setTimeout(this, 'setIndeterminate', this.removeIndeterminate, 1000);
    }
  }

  componentWillUnmount() {
    Timer.clearTimeout(this, 'setIndeterminate');
  }

  onDownload = () => {
    const { areaId, downloadArea } = this.props;
    downloadArea(areaId);
  }

  removeIndeterminate = () => {
    this.setState(() => ({ indeterminate: false }));
  }

  render() {
    const { areaCache } = this.props;
    const { downloading, indeterminate } = this.state;
    const cacheAreaAction = {
      icon: downloadIcon,
      callback: this.onDownload
    };
    const cacheRow = (
      <Row action={cacheAreaAction}>
        <Text style={styles.title}>Make this area offline</Text>
      </Row>
    );
    const progressRow = (
      <Row>
        <View style={styles.rowContent}>
          <Text style={styles.title}>Downloading area</Text>
          <ProgressBar
            indeterminate={indeterminate}
            progress={areaCache.progress}
            width={(Theme.screen.width - 48)}
            color={Theme.colors.color1}
          />
        </View>
      </Row>
    );
    return (downloading ? progressRow : cacheRow);
  }
}

export default AreaCache;
