import React, { Component } from 'react';
import {
  ActivityIndicator,
  View,
  Text
} from 'react-native';
import CustomSwitch from 'components/common/switch';

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

class AlertSystem extends Component {

  componentWillMount() {
    if (!this.props.area.datasets) {
      this.props.getDatasets(this.props.areaId);
    }
  }

  render() {
    const { datasets, id } = this.props.area;

    if (!datasets) return loadingState();
    return (
      <View style={styles.container}>
        {datasets.map((dataset, i) => {
          const onDatasetValueChange = (value) => {
            this.props.setAreaDatasetStatus(id, dataset.slug, value);
          };
          return (
            <View key={i} style={styles.section}>
              <View key={i} style={styles.row}>
                <Text style={styles.title}>{dataset.name}</Text>
                <CustomSwitch value={dataset.value} onValueChange={onDatasetValueChange} />
              </View>
              {dataset.value && dataset.options && dataset.options.length > 0 &&
                dataset.options.map((option, j) => {
                  switch (option.name) {
                    case 'cache': {
                      const onChange = (value) => {
                        if (value) {
                          this.props.cacheArea(id, dataset.slug);
                        } else {
                          this.props.removeCachedArea(id, dataset.slug);
                        }
                      };
                      return (
                        <View key={j} style={[styles.row, styles.nested]}>
                          <Text style={styles.title}>{option.name}</Text>
                          <CustomSwitch value={option.value} onValueChange={onChange} />
                        </View>
                      );
                    }
                    case 'timeframe': {
                      return (
                        <View key={j} style={[styles.row, styles.nested]}>
                          <Text style={styles.title}>TODO: dates timeframe</Text>
                        </View>
                      );
                    }
                    default:
                      return null;
                  }
                })
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
        value: React.PropTypes.bool.isRequired
      }).isRequired,
    )
  }).isRequired,
  getDatasets: React.PropTypes.func.isRequired,
  cacheArea: React.PropTypes.func.isRequired,
  removeCachedArea: React.PropTypes.func.isRequired,
  setAreaDatasetStatus: React.PropTypes.func.isRequired,
  areaId: React.PropTypes.string.isRequired
};

export default AlertSystem;
