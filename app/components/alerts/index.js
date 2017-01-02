import React, { Component } from 'react';
import {
  View
} from 'react-native';
import AlertsList from 'components/alerts/list';
import styles from './styles';

class Alerts extends Component {
  componentDidMount() {
    this.props.fetchData();
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
