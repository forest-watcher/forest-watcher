import React, { Component } from 'react';
import {
  View
} from 'react-native';
import AlertsList from 'components/alerts/list';
import tracker from 'helpers/googleAnalytics';
import styles from './styles';

class Alerts extends Component {
  componentDidMount() {
    this.props.fetchData();
    tracker.trackScreenView('Alerts');
  }
  render() {
    return (
      <View style={styles.container}>
        <AlertsList data={this.props.data} />
      </View>
    );
  }
}

Alerts.propTypes = {
  fetchData: React.PropTypes.func.isRequired,
  data: React.PropTypes.array
};

export default Alerts;
