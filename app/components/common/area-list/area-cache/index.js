import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text } from 'react-native';

import Row from 'components/common/row';
import styles from './styles';

const downloadIcon = require('assets/upload.png');

class AreaCache extends PureComponent {

  static propTypes = {
    areaId: PropTypes.string.isRequired,
    cacheArea: PropTypes.func.isRequired

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
        <Text style={styles.title}>Downloading area</Text>
      </Row>
    );
    return (this.state.downloading ? progressRow : cacheRow);
  }
}

export default AreaCache;
