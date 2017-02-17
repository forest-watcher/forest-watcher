import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableHighlight
} from 'react-native';

import { getCentroIdFromBbox } from 'helpers/geo';
import ImageCache from 'components/common/image-cache';
import styles from './styles';

class AlertsList extends Component {
  componentDidMount() {
    if (!Object.keys(this.props.alerts).length > 0) {
      this.props.getAlerts(this.props.areaId);
    }
  }

  // <Text style={styles.name}>{alert.count}</Text>

  render() {
    const { alerts } = this.props;

    return (
      <View style={styles.content}>
        {Object.keys(alerts).map((key, index) => {
          const alert = alerts[key];
          const centroId = getCentroIdFromBbox(alert.bbox);

          return (
            <TouchableHighlight
              key={`alert-${index}`}
              onPress={() => null}
              activeOpacity={1}
              underlayColor="transparent"
            >
              <View style={styles.item}>
                <View style={styles.image}>
                  <ImageCache
                    style={{ width: 150, height: 150 }}
                    source={{
                      uri: alert.url
                    }}
                  />
                </View>
              </View>
            </TouchableHighlight>
          );
        })
      }
      </View>
    );
  }
}

AlertsList.propTypes = {
  getAlerts: React.PropTypes.func.isRequired,
  alerts: React.PropTypes.array,
  areaId: React.PropTypes.string.isRequired
};

export default AlertsList;
