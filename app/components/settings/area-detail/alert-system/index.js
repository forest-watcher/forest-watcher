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
  componentWillMount() {
    if (!this.props.area.attributes.datasets) {
      this.props.getDatasets(this.props.areaId);
    }
  }

  render() {
    const { attributes, id } = this.props.area;
    const datasets = attributes && attributes.datasets;

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
                  cacheArea={this.props.cacheArea}
                  removeCachedArea={this.props.removeCachedArea}
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
    attributes: React.PropTypes.shape({
      datasets: React.PropTypes.arrayOf(
        React.PropTypes.shape({
          name: React.PropTypes.string.isRequired,
          active: React.PropTypes.bool.isRequired
        }).isRequired,
      )
    }).isRequired
  }).isRequired,
  getDatasets: React.PropTypes.func.isRequired,
  cacheArea: React.PropTypes.func.isRequired,
  removeCachedArea: React.PropTypes.func.isRequired,
  setAreaDatasetStatus: React.PropTypes.func.isRequired,
  updateDate: React.PropTypes.func.isRequired,
  areaId: React.PropTypes.string.isRequired
};

export default AlertSystem;
