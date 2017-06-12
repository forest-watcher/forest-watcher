import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  Text
} from 'react-native';
import CustomSwitch from 'components/common/switch';
import DatasetOptions from 'components/settings/area-detail/alert-system/dataset-options';

import I18n from 'locales';
import Theme from 'config/theme';
import styles from './styles';

function loadingState() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator
        color={Theme.colors.color1}
        style={{ height: 80 }}
        size="large"
      />
    </View>
  );
}

function noAlerts() {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.title}>{I18n.t('areaDetail.noAlerts')}</Text>
        </View>
      </View>
    </View>
  );
}

class AlertSystem extends Component {
  render() {
    const { datasets, id } = this.props.area;

    if (!datasets) return loadingState();
    if (datasets === undefined || datasets.length === 0) return noAlerts();
    return (
      <View style={styles.container}>
        {datasets.map((dataset, i) => {
          const onDatasetValueChange = (value) => {
            this.props.setAreaDatasetStatus(id, dataset.slug, value);
          };
          return (
            <View key={i}>
              <View key={i} style={styles.row}>
                <Text style={styles.title}>{dataset.name}</Text>
                <CustomSwitch value={dataset.active} onValueChange={onDatasetValueChange} />
              </View>
              {dataset.active
                ? <DatasetOptions
                  id={id}
                  dataset={dataset}
                  updateDate={this.props.updateDate}
                  setAreaDatasetCache={this.props.setAreaDatasetCache}
                />
                : null
              }
            </View>
          );
        })}
      </View>
    );
  }
}

AlertSystem.propTypes = {
  area: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    datasets: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        active: React.PropTypes.bool.isRequired
      }).isRequired,
    )
  }).isRequired,
  setAreaDatasetStatus: React.PropTypes.func.isRequired,
  updateDate: React.PropTypes.func.isRequired,
  setAreaDatasetCache: React.PropTypes.func.isRequired
};

export default AlertSystem;
