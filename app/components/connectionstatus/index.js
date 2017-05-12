import React, { Component } from 'react';
import {
  NetInfo
} from 'react-native';

class ConnectionStatus extends Component {
  componentDidMount() {
    NetInfo.isConnected.addEventListener('change', this.handleConnectionChange);
    NetInfo.isConnected.fetch()
      .done((isConnected) => {
        this.props.setIsConnected(isConnected);
      });
  }

  handleConnectionChange = (isConnected) => {
    this.props.setIsConnected(isConnected);
  };

  render() {
    return (null);
  }
}

ConnectionStatus.propTypes = {
  setIsConnected: React.PropTypes.func.isRequired
};

export default ConnectionStatus;
