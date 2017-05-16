import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';
import CustomSwitch from 'components/common/switch';

import styles from './styles';

class AlertSystem extends Component {

  componentWillMount() {
    if (!this.props.area.datasets) {
      this.props.getDatasets(this.props.areaId);
    }
  }

  render() {
    const { datasets } = this.props.area;
    if (!datasets) return null;

    return (
      <View style={styles.container}>
        {datasets.map((alert, i) => (
          <View key={i} style={styles.section}>
            <View key={i} style={styles.row}>
              <Text style={styles.title}>{alert.name}</Text>
              <CustomSwitch value={alert.value} onValueChange={(value) => console.log(value)} />
            </View>
            {alert.value && alert.options && alert.options.length > 0 &&
              alert.options.map((option, j) => (
                <View key={j} style={styles.row}>
                  <Text style={styles.title}>{option.name}</Text>
                </View>
              ))
            }
          </View>
        ))}
      </View>
    );
  }
}

AlertSystem.propTypes = {
  area: React.PropTypes.shape({
    datasets: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        value: React.PropTypes.bool.isRequired
      }).isRequired,
    ).isRequired
  }).isRequired,
  getDatasets: React.PropTypes.func.isRequired,
  areaId: React.PropTypes.string.isRequired
};

export default AlertSystem;
