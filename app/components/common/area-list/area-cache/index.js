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

const downloadIcon = require('assets/upload.png');

class AreaCache extends PureComponent {

  static propTypes = {
    areaId: PropTypes.string.isRequired,
    cacheArea: PropTypes.func.isRequired,
    progress: PropTypes.number
  };

  state = {
    downloading: false
  };

  onDownload = () => {
    const { areaId, cacheArea } = this.props;
    this.setState({ downloading: true });
    if (cacheArea) cacheArea(areaId);
  }

  render() {
    const { progress } = this.props;
    const cacheAreaAction = {
      icon: downloadIcon,
      callback: this.onDownload
    };
    const isIndeterminate = (typeof progress === 'undefined');
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
            indeterminate={isIndeterminate}
            progress={progress}
            width={(Theme.screen.width - 48)}
            color={Theme.colors.color1}
          />
        </View>
      </Row>
    );
    return (this.state.downloading ? progressRow : cacheRow);
  }
}

export default AreaCache;
