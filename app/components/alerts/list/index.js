import React, { Component } from 'react';
import {
  View,
  Animated,
  TouchableHighlight
} from 'react-native';

import ImageCache from 'components/common/image-cache';
import LoadingPlaceholder from 'components/alerts/list/loading';
import styles from './styles';

function renderPlaceholder() {
  const placeholders = [];

  for (let x = 0; x < 3; x++) {
    placeholders.push(
      <LoadingPlaceholder key={x} index={x} />
    );
  }

  return (
    <View style={styles.content}>{placeholders}</View>
  );
}

class AlertsList extends Component {
  constructor() {
    super();

    this.state = {
      alerts: null,
      bounceValue: new Animated.Value(1)
    };
  }

  componentDidMount() {
    // Temp
    setTimeout(() => {
      this.checkData();
    }, 3000);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.alerts) {
      this.setState({ alerts: newProps.alerts });
    }
  }

  checkData() {
    if (!Object.keys(this.props.alerts).length > 0) {
      this.props.getAlerts(this.props.areaId);
    } else {
      this.setState({ alerts: this.props.alerts });
    }
  }

  render() {
    const { alerts } = this.state;

    return (
      <View style={styles.content}>
        {alerts
          ?
            Object.keys(alerts).map((key, index) => {
              const alert = alerts[key];

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
          :
            renderPlaceholder()
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
