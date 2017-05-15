import React from 'react';
import {
  View,
  Text
} from 'react-native';
import CustomSwitch from 'components/common/switch';

import styles from './styles';

function AlertSystem(props) {
  return (
    <View style={styles.container}>
      {props.alerts.map((alert, i) => (
        <View key={i} style={styles.section}>
          <View key={i} style={styles.row}>
            <Text style={styles.title}>{alert.name}</Text>
            <CustomSwitch value={alert.value} onValueChange={(value) => console.log(value)} />
          </View>
          {alert.options && alert.options.length > 0 &&
            alert.options.map((option, j) => (
              <View key={j} style={styles.row}>
                <Text style={styles.title}>{option.name}</Text>
                <CustomSwitch value={option.value} onValueChange={(value) => console.log(value)} />
              </View>
            ))
          }
        </View>
      ))}
    </View>
  );
}

AlertSystem.propTypes = {
  alerts: React.PropTypes.arrayOf(
    React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      value: React.PropTypes.bool.isRequired
    }).isRequired,
  ).isRequired
};

export default AlertSystem;
