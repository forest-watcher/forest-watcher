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
    const { datasets, id } = this.props.area;
    if (!datasets) return null;

    return (
      <View style={styles.container}>
        {datasets.map((alert, i) => (
          <View key={i} style={styles.section}>
            <View key={i} style={styles.row}>
              <Text style={styles.title}>{alert.name}</Text>
              <CustomSwitch value={alert.value} onValueChange={(value) => console.info('changed the alert', value)} />
            </View>
            {alert.value && alert.options && alert.options.length > 0 &&
              alert.options.map((option, j) => {
                switch (option.name) {
                  case 'cache': {
                    const onChange = (value) => {
                      if (value) {
                        this.props.cacheArea(id, alert.slug);
                      } else {
                        this.props.removeCachedArea(id, alert.slug);
                      }
                    };
                    return (
                      <View key={j} style={styles.row}>
                        <Text style={styles.title}>{option.name}</Text>
                        <CustomSwitch value={alert.cached || false} onValueChange={onChange} />
                      </View>
                    );
                  }
                  case 'timeframe': {
                    const onChange = (value) => console.info('changed the timefrime', value);
                    return (
                      <View key={j} style={styles.row}>
                        <Text style={styles.title}>{option.name}</Text>
                        <CustomSwitch value={alert.value} onValueChange={onChange} />
                      </View>
                    );
                  }
                  default:
                    return null;
                }
              })
            }
          </View>
        ))}
      </View>
    );
  }
}

AlertSystem.propTypes = {
  area: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    cached: React.PropTypes.bool.isRequired,
    datasets: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        name: React.PropTypes.string.isRequired,
        value: React.PropTypes.bool.isRequired
      }).isRequired,
    ).isRequired
  }).isRequired,
  getDatasets: React.PropTypes.func.isRequired,
  cacheArea: React.PropTypes.func.isRequired,
  removeCachedArea: React.PropTypes.func.isRequired,
  areaId: React.PropTypes.string.isRequired
};

export default AlertSystem;
